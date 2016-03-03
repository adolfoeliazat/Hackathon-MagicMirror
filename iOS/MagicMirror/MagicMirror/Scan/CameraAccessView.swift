//
//  CameraAccessView.swift
//  NewStoreUI
//
//  Created by Igor Mursa on 01/12/15.
//  Copyright © 2015 NewStore. All rights reserved.
//

import UIKit

public class CameraAccessView: UIView {
    
    // MARK: - Outlets
    @IBOutlet private weak var cameraImageView: UIImageView!
    
    // MARK: - Life Cycle
    public override init(frame: CGRect) {
        super.init(frame: frame)
        self.translatesAutoresizingMaskIntoConstraints = false
        
        loadCameraAccessView()
    }

    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        
        loadCameraAccessView()
    }
    
    private func loadCameraAccessView() {
        let bundle = NSBundle(forClass: CameraAccessView.self)
        let nib = UINib(nibName: "CameraAccessView", bundle: bundle)
        
        guard let subview = nib.instantiateWithOwner(self, options: nil).first as? UIView else { return }

        self.addSubview(subview)
        
        subview.translatesAutoresizingMaskIntoConstraints = false
        subview.topAnchor.constraintEqualToAnchor(self.topAnchor).active = true
        subview.bottomAnchor.constraintEqualToAnchor(self.bottomAnchor).active = true
        subview.leadingAnchor.constraintEqualToAnchor(self.leadingAnchor).active = true
        subview.trailingAnchor.constraintEqualToAnchor(self.trailingAnchor).active = true
        
        self.cameraImageView.tintColor = UIColor.grayColor()
    }
    
    // MARK: - Actions
    
    @IBAction func goToSettings(sender: AnyObject) {
        let application = UIApplication.sharedApplication()
        guard let settingsURL = NSURL(string: UIApplicationOpenSettingsURLString) else { return }
        
        if application.canOpenURL(settingsURL) {
            application.openURL(settingsURL)
        }
    }
}
