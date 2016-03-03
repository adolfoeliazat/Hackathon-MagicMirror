//
//  QRScannerController.swift
//  OmniApp
//
//  Created by Igor Mursa on 28/10/15.
//  Copyright © 2015 NewStore. All rights reserved.
//

import UIKit
import AVFoundation
//import NewStoreFoundation

/// Start a video capture sesession and recognize QR codes.
public class QRScannerController: NSObject {
    
    /// The order of the CALayer objects that compose this view.
    enum LayerOrder: Int {
        /// The pulsating layer position.
        case VideoPreview
        /// The position of the pin image frame.
        case Crosshair
        /**
         Gets the z order based on the current layer position.
         - returns: a z order value.
         */
        func zPosition() -> CGFloat {
            return CGFloat(rawValue)
        }
    }
    
    /// The controller delegate.
    public weak var delegate: QRScannerControllerDelegate?
    /// The container for the ACCaptureSession
    private weak var scannerContainerView: UIView!
    /// Video capture session.
    private var captureSession: AVCaptureSession = AVCaptureSession()
    /// Video preview.
    private var videoPreviewLayer: AVCaptureVideoPreviewLayer?
    /// Video crosshair.
    private weak var crosshairLayer: CAShapeLayer? = nil
    /// QR code scan result queue.
    private var metadataQueue = GCD.createQueue("com.newstore.MagicMirror.AVCaptureMetadataQueue")
    /// Size of the square crosshair rectangle to animate
    private var squareCrosshairSize: CGSize {
        let width = min(self.scannerContainerView.frame.width, self.scannerContainerView.frame.height) / 2
        return CGSize(width: width, height: width)
    }
    /// Size of the flat crosshair rectangle to animate
    private var flatCrosshairSize: CGSize {
        let width = min(self.scannerContainerView.frame.width, self.scannerContainerView.frame.height) - 2 * 63.0 // Space to margin        
        let height = width / 2.5 // rectangleScaling Ratio
        return CGSize(width: width, height: height)
    }
    /// The width and height of the crosshair lines
    private let crosshairLineLength: CGFloat = 6.0
    /// If set to true, starts animating the crosshair and scanning for QR codes.
    public var scanning: Bool = false {
        didSet {
            if scanning {
                guard crosshairLayer == nil else {
                    return
                }
                GCD.async(GCD.mainQueue()) { [weak self] in
                    guard let rectLayer = self?.createCrosshairLayer() else {
                        return
                    }
                    self?.scannerContainerView.layer.addSublayer(rectLayer)
                    self?.crosshairLayer = rectLayer
                }
                
            } else {
                GCD.async(GCD.mainQueue()) {
                    self.crosshairLayer?.removeFromSuperlayer()
                    self.crosshairLayer = nil
                }
            }
        }
    }
    
    /**
     Public initializer.
     
     - parameter containerView: The view that contains the video preview layer.
    */
    public init(withContainerView containerView: UIView) {
        self.captureSession = AVCaptureSession()
        self.scannerContainerView = containerView
        super.init()
    }
    
    /**
     Configure AVCaptureSession, in case of failure delegate will be called
     */
    func configureQRScaningSession() {
        guard let captureDevice = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeVideo) else {
            self.delegate?.videoCaptureControllerDidFailToAquireCameraAccess(self)
            return
        }
        setUpTorchWithDevice(captureDevice)
        do {
            // Get an instance of the AVCaptureDeviceInput class using the previous device object.
            let input = try AVCaptureDeviceInput(device: captureDevice)
            // Set the input device on the capture session.
            self.captureSession.addInput(input)
            configurePreviewLayerForSession(self.captureSession)
            configureMetaDataForAVCaptureSession(self.captureSession)
        } catch {
            self.delegate?.videoCaptureControllerDidFailToAquireCameraAccess(self)
        }
    }
    
    /**
     Start capture session
     */
    func startCaptureSession() {
        if !self.scanning {
            self.scanning = true
            self.captureSession.startRunning()
        }
    }
    
    /**
     Stop the capturing session
     */
    func stopCaptureSession() {
        self.scanning = false
        self.captureSession.stopRunning()
    }
   
    /**
     Grant access to the Torch Light, set the Tourch Light to Auto mode
     
     - parameter device: the capture device
     */
    private func setUpTorchWithDevice(device: AVCaptureDevice) {
        do {
            try device.lockForConfiguration()
        } catch {
            // handle error
            return
        }
        if device.isTorchModeSupported(.Auto) {
            let videoOutput = AVCaptureVideoDataOutput()
            self.captureSession.addOutput(videoOutput)
            device.focusMode = .ContinuousAutoFocus
            device.flashMode = .Auto
            device.torchMode = .Auto
        }
        device.unlockForConfiguration()
    }
    
    /**
     Confifure AVCaptureMetadataOutput with AVMetadataObjectTypeQRCode as Object Type
     
     - parameter session: the capture session
     */
    private func configureMetaDataForAVCaptureSession(session: AVCaptureSession) {
        let captureMetadataOutput = AVCaptureMetadataOutput()
        session.addOutput(captureMetadataOutput)
        captureMetadataOutput.metadataObjectTypes = [AVMetadataObjectTypeUPCECode,
            AVMetadataObjectTypeCode39Code,
            AVMetadataObjectTypeCode39Mod43Code,
            AVMetadataObjectTypeEAN13Code,
            AVMetadataObjectTypeEAN8Code,
            AVMetadataObjectTypeCode93Code,
            AVMetadataObjectTypeCode128Code,
            AVMetadataObjectTypePDF417Code,
            AVMetadataObjectTypeQRCode,
            AVMetadataObjectTypeAztecCode]
        captureMetadataOutput.setMetadataObjectsDelegate(self, queue: self.metadataQueue)
    }
    
    /**
     Configure AVCaptureVideoPreviewLayer based on AVCaptureSession
     
     - parameter session: the capture session
     */
    private func configurePreviewLayerForSession(session: AVCaptureSession) {
        self.videoPreviewLayer = AVCaptureVideoPreviewLayer(session: session)
        guard let videoPreviewLayer = self.videoPreviewLayer else { return }
        
        videoPreviewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill
        videoPreviewLayer.frame = self.scannerContainerView.bounds
        videoPreviewLayer.zPosition = LayerOrder.VideoPreview.zPosition()
        videoPreviewLayer.frame = self.scannerContainerView.bounds
        GCD.async(GCD.mainQueue()) {
            self.scannerContainerView.layer.addSublayer(videoPreviewLayer)
        }
    }
    
    //MARK: - Video Capture Control
    /**
     Check the authorization status of the camera and return the restrictionHandler or completionHandler

     - parameter restrictionHandler: in case of restriction, restriction block will be called
     - parameter authorizationHandler: in case of .Authorized or user input from the user, the authorizationHandler closure will be called with true as parameter
     */
    internal func checkVideoCapturingStatusWithRestrictionHandler(restrictionHandler: (AVAuthorizationStatus?) -> Void, authorizationHandler: (Bool) -> Void) {
        #if (arch(i386) || arch(x86_64)) && os(iOS)
            let authStatus = AVAuthorizationStatus.Restricted
        #else
            let authStatus = AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
        #endif
        
        if authStatus == .Denied || authStatus == .Restricted {
            restrictionHandler(authStatus)
        } else if authStatus != .Authorized {
            AVCaptureDevice.requestAccessForMediaType(AVMediaTypeVideo, completionHandler: authorizationHandler)
        } else {
            authorizationHandler(true)
        }
    }
    
    /**
     Update the frame of the video preview layer.
     */
    func updateVideoPreviewLayout() {
        self.videoPreviewLayer?.frame = self.scannerContainerView.bounds
        // Reset the animation when the frame changes
        if self.scanning {
            self.scanning = false
            self.scanning = true
        }
    }

    /**
     Create and configure the center crosshair.
     
     - returns: An animating crosshair shaped layer.
     */
    private func createCrosshairLayer() -> CAShapeLayer {
        let crosshairLayer = CAShapeLayer()
        crosshairLayer.borderColor = UIColor.whiteColor().CGColor
        crosshairLayer.fillColor = UIColor.clearColor().CGColor
        crosshairLayer.shouldRasterize = true
        crosshairLayer.frame.size = self.squareCrosshairSize
        crosshairLayer.position = self.scannerContainerView.center
        crosshairLayer.zPosition = LayerOrder.Crosshair.zPosition()
        crosshairLayer.path = crosshairPathInRect(crosshairLayer.bounds)
        crosshairLayer.lineWidth = 2
        crosshairLayer.strokeColor = UIColor.whiteColor().CGColor
        crosshairLayer.addAnimation(createCrosshairAnimation(), forKey: nil)

        return crosshairLayer
    }
    
    /**
     Generate the animation for the center crosshair.
     
     - returns: A composed animation for the center crosshair.
     */
    private func createCrosshairAnimation() -> CAAnimation {
        let squareRect = CGRect(origin: CGPoint.zero, size: self.squareCrosshairSize)
        let flatRect = CGRect(origin: CGPoint.zero, size: self.flatCrosshairSize)
        let resizeAnimation = createResizeAnimationFromRect(squareRect, toRect: flatRect)
        let positionAnimation = createCenterPositionAnimation()
        let animationGroup = CAAnimationGroup()
        animationGroup.animations = [resizeAnimation, positionAnimation]
        animationGroup.autoreverses = true
        animationGroup.repeatCount = Float.infinity
        animationGroup.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
        animationGroup.duration = 1.5
        
        return animationGroup
    }
    
    /**
     Generate the resize animation for the center crosshair from a given rect to another given rect.
     
     - parameter fromRect: the rect frame to start the animation from
     - parameter toRect: the rect frame to end the animation with
     
     - returns: A resize animation for the center crosshair.
     */
    private func createResizeAnimationFromRect(fromRect: CGRect, toRect: CGRect) -> CABasicAnimation {
        let resizeAnimation = CABasicAnimation()
        let pathForSquareFrame = crosshairPathInRect(fromRect)
        let pathForRectFrame = crosshairPathInRect(toRect)
        resizeAnimation.keyPath = "path"
        resizeAnimation.fromValue = pathForSquareFrame
        resizeAnimation.toValue = pathForRectFrame
        
        return resizeAnimation
    }
    
    /**
     Generate the centering animation for the crosshair.
     
     - returns: A center positioning animation.
     */
    private func createCenterPositionAnimation() -> CABasicAnimation {
        let centerX = self.scannerContainerView.center.x + (self.squareCrosshairSize.width - self.flatCrosshairSize.width) / 2
        let centerY = self.scannerContainerView.center.y + (self.squareCrosshairSize.height - self.flatCrosshairSize.height) / 2
        let positionAnimation = CABasicAnimation()
        positionAnimation.keyPath = "position"
        positionAnimation.fromValue = NSValue(CGPoint: self.scannerContainerView.center)
        positionAnimation.toValue = NSValue(CGPoint: CGPoint(x: centerX, y: centerY))
        
        return positionAnimation
    }
    
    /**
     Will generate a CGPath with crosshair points and border based on the frame
     
     - parameter rect: A rectangle with the needed size for the generated path
     
     - returns: generated CGPath
     */
    func crosshairPathInRect(rect: CGRect) -> CGPath {
        // Functions to simplify drawing
        func addLineToPath(path: UIBezierPath, fromPoint: CGPoint, toPoint: CGPoint) {
            path.moveToPoint(fromPoint)
            path.addLineToPoint(toPoint)
        }
        func addHorizontalLineToPath(path: UIBezierPath, fromPoint: CGPoint, length: CGFloat) {
            addLineToPath(path, fromPoint: fromPoint, toPoint: CGPoint(x: fromPoint.x + length, y: fromPoint.y))
        }
        func addVerticalLineToPath(path: UIBezierPath, fromPoint: CGPoint, length: CGFloat) {
            addLineToPath(path, fromPoint: fromPoint, toPoint: CGPoint(x: fromPoint.x, y: fromPoint.y + length))
        }
        
        let crosshairPath = UIBezierPath(rect: rect)
        addHorizontalLineToPath(crosshairPath, fromPoint: CGPoint(x: 0, y: rect.size.height / 2), length: crosshairLineLength)
        addHorizontalLineToPath(crosshairPath, fromPoint: CGPoint(x: rect.size.width, y: rect.size.height / 2), length: -crosshairLineLength)
        addVerticalLineToPath(crosshairPath, fromPoint: CGPoint(x: rect.size.width / 2, y: 0), length: crosshairLineLength)
        addVerticalLineToPath(crosshairPath, fromPoint: CGPoint(x: rect.size.width / 2, y: rect.size.height), length: -crosshairLineLength)
        
        return crosshairPath.CGPath
    }
}

// MARK: - AVCaptureMetadataOutputObjectsDelegate
extension QRScannerController: AVCaptureMetadataOutputObjectsDelegate {
    
    public func captureOutput(captureOutput: AVCaptureOutput!, didOutputMetadataObjects metadataObjects: [AnyObject]!, fromConnection connection: AVCaptureConnection!) {
        if let metadataMachineReadableCodeObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
            let qrString = metadataMachineReadableCodeObject.stringValue
            where self.scanning {
                print(qrString)
                self.captureSession.stopRunning()
                GCD.async(GCD.mainQueue()) { [unowned self] in
                    self.scanning = false
                    AudioServicesPlayAlertSound(kSystemSoundID_Vibrate)
                    self.delegate?.videoCaptureController(self, didRecognizeQRWithString: qrString)
                }
        }
    }
}

/**
 Classes that conform to this protocol can handle recognized QR codes or error states on behalf of the scanner controller.
 */
public protocol QRScannerControllerDelegate: class {
    
    /**
     This delegate method is called when a QR code is recognized.
     
     - parameter controller: The controller that did the recognition.
     - parameter string:     The decoded string from the QR code.
     */
    func videoCaptureController(controller: QRScannerController, didRecognizeQRWithString string: String)  -> Bool
    
    /**
     This delegate method is called when a scanning error occurs.
     
     - parameter controller: The controller that triggered the error.
     */
    func videoCaptureControllerDidFailToAquireCameraAccess(controller: QRScannerController)
}
