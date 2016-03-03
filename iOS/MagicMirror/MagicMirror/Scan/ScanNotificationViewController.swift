//
//  ScanNotificationViewController.swift
//  OmniApp
//
//  Created by Igor Mursa on 05/11/15.
//  Copyright © 2015 NewStore. All rights reserved.
//

import UIKit
//import NewStoreUI
/// Shows a QR code scanning result.
class ScanNotificationViewController: UIViewController {
    
    @IBOutlet weak var bottomLayoutConstraint: NSLayoutConstraint!
    @IBOutlet weak var bottomView: UIView!
    @IBOutlet weak var scanResultLabel: UILabel!
    /// The scanned string.
    var scanResult: String? = nil
    /// A closure to be executed before this view controller will be dismissed.
    var willDismissViewController: (() -> Void)? = nil
    /// A closure to be executed after this view controller is dismissed.
    var didDismissViewController: (() -> Void)? = nil
    /// The color of the background overlay view.
    let overlayColor = UIColor.blackColor().colorWithAlphaComponent(0.5)
    
    // MARK: - Lifecycle
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.scanResultLabel.text = self.scanResult
        self.bottomLayoutConstraint.constant = -self.bottomView.frame.height
        NSNotificationCenter.defaultCenter().addObserver(self, selector: Selector("applicationWillResignActive"), name: UIApplicationWillResignActiveNotification, object: nil)
        self.view.setNeedsUpdateConstraints()
        self.view.layoutIfNeeded()
                        
    }
    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        self.bottomLayoutConstraint.constant = 0
        let animations = {
            self.view.backgroundColor = self.overlayColor
            self.view.layoutIfNeeded()
        }
        UIView.animateWithDuration(0.3, animations: animations, completion: nil)
    }

    //Dismiss View Controller when entering backgorund
    func applicationWillResignActive() {
        self.didDismissViewController?()
    }
    
    deinit {
        NSNotificationCenter.defaultCenter().removeObserver(self, name: UIApplicationWillResignActiveNotification, object: nil)
    }
    
    @IBAction func dismissViewConstroller(sender: AnyObject) {
        self.bottomLayoutConstraint.constant = -self.bottomView.frame.height
        let animations = {
            self.view.backgroundColor = self.overlayColor.colorWithAlphaComponent(0)
            self.view.layoutIfNeeded()

        }
        self.willDismissViewController?()
        UIView.animateWithDuration(0.3, animations: animations, completion: { finished in
                self.didDismissViewController?()
        })
    }
}
