export function Brand() {
  return (
    <>
      <img
        className="brand-mark"
        src={`${import.meta.env.BASE_URL}favicon.svg`}
        width="48"
        height="48"
        alt=""
      />
      <span className="brand-wordmark">
        Nextage<span>Class</span>
      </span>
    </>
  )
}
