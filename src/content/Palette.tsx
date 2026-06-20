interface PaletteProps {
    show: boolean;
}



const Palette = (props: PaletteProps) => {
    const {show} = props;



    if (!show) {
    return null;
  }

  useEfect(() => {
    
  }, [show]);

  return (
    <div className="paletteContainer">
        <div className="colorsPcker">
            <div className="colorRow">
                {/* 4 options */}
            </div>
            <div className="colorRow">
                {/* 4 options */}
            </div>
        </div>
        <div className="textStylePicker">
            <div className="tile active" id="default"></div>
            <div className="tile" id="underline"></div>
            <div className="tile" id="wave"></div>
            <div className="tile" id="strike"></div>
        </div>
    </div>
  )
}

export default Palette