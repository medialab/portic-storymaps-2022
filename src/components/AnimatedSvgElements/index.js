import { useSpring, animated } from 'react-spring';

export function AnimatedGroup({
  children,
  style,
  onClick,
  className,
  onMouseEnter,
  onMouseLeave,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.g {...animatedProps} className={className} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={style}>
      {children}
    </animated.g>
  )
}
export function AnimatedForeignObject({
  children,
  style,
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.foreignObject className={className} {...animatedProps} style={style}>
      {children}
    </animated.foreignObject>
  )
}

export function AnimatedText({
  children,
  style,
  onClick,
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.text {...animatedProps} className={className} onClick={onClick} style={style}>
      {children}
    </animated.text>
  )
}


export function AnimatedCircle({
  children,
  style,
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.circle className={className} {...animatedProps} style={style}>
      {children}
    </animated.circle>
  )
}


export function AnimatedLine({
  children,
  style,
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.line className={className} {...animatedProps} style={style}>
      {children}
    </animated.line>
  )
}

export function AnimatedPath({
  onClick,
  className,
  ...props
}) {
  const mouseProps = Object.keys(props).filter(key => key.includes('Mouse'))
    .reduce((res, key) => ({ ...res, [key]: props[key] }), {});
  const animatedProps = useSpring(props);

  return (
    <animated.path className={className} onClick={onClick} {...animatedProps} {...mouseProps} />
  )
}

export function AnimatedRect({
  className,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
    <animated.rect className={className} {...animatedProps} />
  )
}