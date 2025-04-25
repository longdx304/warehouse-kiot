export const TrackingLink = ({ trackingLink }: any) => {
  if (trackingLink.url) {
    return (
      <a
        style={{ textDecoration: "none" }}
        target="_blank"
        href={trackingLink.url}
        rel="noreferrer"
      >
        <div className="text-blue-600 ml-2 text-xs">{trackingLink.tracking_number} </div>
      </a>
    )
  } else {
    return (
      <span className="text-blue-600 ml-2 text-xs">{trackingLink.tracking_number} </span>
    )
  }
}
