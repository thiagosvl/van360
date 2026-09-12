import { FloatingVideoBubble, FloatingVideoBubbleProps } from "./video/FloatingVideoBubble";

export type VideoCommerceProps = FloatingVideoBubbleProps;

export function VideoCommerce(props: VideoCommerceProps) {
  return <FloatingVideoBubble {...props} />;
}
