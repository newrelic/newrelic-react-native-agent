#import <React/RCTViewManager.h>
#import <React/RCTView.h>

@interface NRUnMaskComponentViewManager : RCTViewManager
@end

@implementation NRUnMaskComponentViewManager

RCT_EXPORT_MODULE(NRUnMaskComponentView)

- (UIView *)view
{

  UIView *view = [[RCTView alloc] init];
  view.accessibilityIdentifier = @"nr-unmask"; // Set an accessibility identifier for testing purposes
  return view;
}


@end