//
//  ScanViewController.swift
//  OmniApp
//
//  Created by Florin Pop on 02/10/15.
//  Copyright © 2015 NewStore. All rights reserved.
//

import UIKit
//import NewStoreUI
//import NewStoreFoundation

/// This view controller allows scanning a QR code and presenting the results.
class ScanViewController: UIViewController {

    // MARK: - Properties
    private var cameraAccessView: UIView?
    /// Provides the video preview and scans for QR codes.
    var qrScannerController: QRScannerController!
    
    /// The video preview.
    @IBOutlet weak var scannerContainerView: UIView!
    @IBOutlet weak var detailsView: UIView!
    
    var shouldStartCapturing = false {
        willSet {
            if newValue == true {
                addAplicationStateObserver()
            }
        }
    }

    // MARK: - ViewController Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.qrScannerController = QRScannerController(withContainerView: scannerContainerView)
        qrScannerController.delegate = self
        qrScannerController.checkVideoCapturingStatusWithRestrictionHandler({ [weak self] authorizationStatus in
            self?.showCameraAccessView()
            },
            authorizationHandler: { [weak self] accessGranted in
                guard accessGranted else {
                    GCD.async(GCD.mainQueue()) {
                        self?.showCameraAccessView()
                    }
                    return
                }
                self?.qrScannerController.configureQRScaningSession()
                self?.hideCameraAccessView()
                self?.shouldStartCapturing = true
                self?.detailsView.hidden = false
            })
    }
    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        if shouldStartCapturing {
            startCapturing()
        }
    }
    
    override func viewWillDisappear(animated: Bool) {
        super.viewWillDisappear(animated)
        self.qrScannerController.stopCaptureSession()
    }
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIApplicationWillResignActiveNotification, object: nil)
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIApplicationDidBecomeActiveNotification, object: nil)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        self.qrScannerController.updateVideoPreviewLayout()
    }
    
    //Stop CaptureSession when the app goes to background state
    func applicationWillResignActive() {
        self.qrScannerController.stopCaptureSession()
    }
    
    //Start CaptureSession when the app will enter foreground
    func applicationDidBecomeActiveNotification() {
       startCapturing()
    }
    
    /**
     Start Capture Session
     */
    func startCapturing() {
        self.qrScannerController.startCaptureSession()
    }
    func addAplicationStateObserver() {
        startCapturing()
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("applicationWillResignActive"), name: UIApplicationWillResignActiveNotification, object: nil)
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("applicationDidBecomeActiveNotification"), name: UIApplicationDidBecomeActiveNotification, object: nil)
    }
    
    // MARK: - Camera Access View
    private func showCameraAccessView() {
        guard self.cameraAccessView == nil else { return }
        
        // Hide the details view if the access view is presented
        self.detailsView.hidden = true
        
        let view = CameraAccessView()
        self.cameraAccessView = view
        
        self.view.addSubview(view)
        
        view.topAnchor.constraintEqualToAnchor(self.topLayoutGuide.bottomAnchor).active = true
        view.bottomAnchor.constraintEqualToAnchor(self.bottomLayoutGuide.topAnchor).active = true
        view.leadingAnchor.constraintEqualToAnchor(self.view.leadingAnchor).active = true
        view.trailingAnchor.constraintEqualToAnchor(self.view.trailingAnchor).active = true
    }
    
    private func hideCameraAccessView() {
        guard self.cameraAccessView != nil else { return }
        
        // Show the details view
        self.detailsView.hidden = false
        GCD.async(GCD.mainQueue()) {
            self.cameraAccessView?.removeFromSuperview()
        }
    }
}

// MARK: - QRScannerControllerDelegate
extension ScanViewController: QRScannerControllerDelegate {
    // If a QR code was detected this delegate method will be called
    func videoCaptureController(controller: QRScannerController, didRecognizeQRWithString string: String) {

        let scanResult = string
        print("code scanned \(scanResult)")
        //TODO: call backend here
    }
    
    // In case of a failure this delegate method will be called
    func videoCaptureControllerDidFailToAquireCameraAccess(controller: QRScannerController) {
        GCD.async(GCD.mainQueue()) {
            // TODO: Error handling
        }
    }
}
