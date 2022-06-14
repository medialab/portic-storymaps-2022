import { useSpring, animated } from 'react-spring'

export default function AnimatedPath({
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