import svg from './svgAsStr';

export default function SchemaSources({
  width,
  height,
  atlasMode
}) {
  return (
    <div 
      className="SchemaSources"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      dangerouslySetInnerHTML={{
        __html: svg({width, height: atlasMode ? window.innerHeight : height})
      }}
    />
  )
}