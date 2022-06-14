import { useSpring, animated } from 'react-spring'

export default function AnimatedPath({
    ...props
}) {
    const animatedProps = useSpring(props);

    return (
        <animated.path {...animatedProps} />
    )
}