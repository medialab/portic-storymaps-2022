import { useSpring, animated } from 'react-spring';

export function AnimatedGroup({
    children,
    style,
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.g {...animatedProps} style={style}>
            {children}
        </animated.g>
    )
}

export function AnimatedText({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.text {...animatedProps} style={style}>
          {children}
      </animated.text>
  )
}


export function AnimatedCircle({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.circle {...animatedProps} style={style}>
          {children}
      </animated.circle>
  )
}


export function AnimatedLine({
  children,
  style,
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.line {...animatedProps} style={style}>
          {children}
      </animated.line>
  )
}

export function AnimatedPath({
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.path {...animatedProps} />
    )
}

export function AnimatedRect({
  ...props
}) {
  const animatedProps = useSpring(props);

  return (
      <animated.rect {...animatedProps} />
  )
}