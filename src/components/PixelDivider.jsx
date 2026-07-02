function PixelDivider() {
  return (
    <div className="pixel-divider" aria-hidden="true">
      {Array.from({ length: 36 }).map((_, index) => (
        <span key={index} style={{ '--delay': `${(index % 9) * 0.12}s` }} />
      ))}
    </div>
  );
}

export default PixelDivider;
