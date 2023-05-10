import { useSpring, animated } from 'react-spring';

export const Line = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.line className={className} onClick={onClick} style={style} {...props} />
  )
}

export const G =({children, className, onClick, onMouseEnter, onMouseLeave, config = {}, ...inputProps})  => {
  const props = useSpring({to: inputProps, config});
  return (
    <animated.g className={className} {...{onMouseEnter, onMouseLeave, onClick}} {...props}>
      {children}
    </animated.g>
  )
}

export const Text =({children, style, className, onClick, config = {}, ...inputProps})  => {
  const props = useSpring({to: inputProps, config});
  return (
    <animated.text className={className} style={style} onClick={onClick} {...props}>
      {children}
    </animated.text>
  )
}