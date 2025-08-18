#import <React/RCTViewManager.h>
#import <React/RCTView.h>

@interface NRMaskComponentViewManager : RCTViewManager
@end

@implementation NRMaskComponentViewManager

RCT_EXPORT_MODULE(NRMaskComponentView)

- (UIView *)view
{

  UIView *view = [[RCTView alloc] init];
  view.accessibilityIdentifier = @"nr-mask"; // Set an accessibility identifier for testing purposes
  return view;
}


@end