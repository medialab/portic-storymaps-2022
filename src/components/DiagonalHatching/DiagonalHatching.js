export default function DiagonalHatching({
    id,
    lineGap = 10,
    color = 'black',
    angle = 45,
    strokeWidth = 1,
    ...props
}) {
    return (
        <pattern id={id} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle} 0 0)`} width={lineGap} height="10">
            <line
                x1="0" y1="0" x2="0" y2="10"
                style={{
                    stroke: color,
                    strokeWidth
                }}
            />
        </pattern>
    )
}