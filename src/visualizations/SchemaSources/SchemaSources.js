import svg from './svgAsStr';

export default function SchemaSources({
  width,
  height,
  atlasMode,
  lang
}) {
  // console.log({width, height})
  return (
    <div 
      className="SchemaSources"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // height: '100%'
      }}
      dangerouslySetInnerHTML={{
        __html: svg({width, height: atlasMode ? window.innerHeight : height, lang})
      }}
    />
  )
}