#import <React/RCTViewManager.h>
#import <React/RCTView.h>

@interface NRBlockComponentViewManager : RCTViewManager
@end

@implementation NRBlockComponentViewManager

RCT_EXPORT_MODULE(NRBlockComponentView)

- (UIView *)view
{

  UIView *view = [[RCTView alloc] init];
  view.accessibilityIdentifier = @"nr-block";
  return view;
}


@end
