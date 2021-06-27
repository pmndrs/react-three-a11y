let stylesHiddenButScreenreadable = {
  opacity: 0,
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  overflow: 'hidden',
  transform: 'translateX(-50%) translateY(-50%)',
  display: 'inline-block',
  userSelect: 'none' as const,
  WebkitUserSelect: 'none' as const,
  WebkitTouchCallout: 'none' as const,
  margin: 0,
};

export { stylesHiddenButScreenreadable };
