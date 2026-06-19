import Button from "../shared/components/button/Button";
import Icon from "../shared/components/icon/Icon";
import "./styles.scss";

const ICON_SIZE = { sm: 14, md: 16, lg: 20 } as const;

const TYPES = ["default", "outline", "tonal"] as const;
const PALETTES = ["primary", "secondary"] as const;
const SIZES = ["sm", "md", "lg"] as const;

const Options = () => {
  return (
    <div className="options">
      <h1>Button showcase</h1>

      {PALETTES.map((palette) => (
        <section key={palette} className="showcase-palette">
          <h2>{palette}</h2>

          {TYPES.map((type) => (
            <div key={type} className="showcase-row">
              <span className="showcase-row__label">{type}</span>

              <div className="showcase-row__items">
                {SIZES.map((size) => (
                  <Button key={size} type={type} palette={palette} size={size}>
                    {size}
                  </Button>
                ))}

                {SIZES.map((size) => (
                  <Button
                    key={`icon-${size}`}
                    type={type}
                    palette={palette}
                    size={size}
                  >
                    <Icon name="marker" size={ICON_SIZE[size]} />
                    <span>Marker</span>
                  </Button>
                ))}

                {SIZES.map((size) => (
                  <Button
                    key={`icon-only-${size}`}
                    type={type}
                    palette={palette}
                    size={size}
                    iconOnly
                  >
                    <Icon name="delete" size={ICON_SIZE[size]} />
                  </Button>
                ))}

                <Button type={type} palette={palette} disabled>
                  Disabled
                </Button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default Options;
