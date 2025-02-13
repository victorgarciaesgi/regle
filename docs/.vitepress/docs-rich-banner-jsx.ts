const banner = `
<div
  style={{
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0b0d0c",
    fontSize: 32,
    fontWeight: 600,
    padding: "0 40px",
    columnGap: 40,
    backgroundImage:
      "radial-gradient(circle at 25px 25px, rgba(255,255,255, 0.5) 1%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0, 187, 127, 0.3) 2%, transparent 0%)",
    backgroundSize: "100px 100px"
  }}
>
  
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      maxWidth: 450,

      flexWrap: "wrap",
      rowGap: 4,
      color: "white"
    }}
  >
    <div
      style={{
        fontSize: 24,
        fontWeight: 'normal',
        lineHeight: 1.3,
        color: "transparent",
        backgroundImage: "linear-gradient(90deg, #1aedaa, #00bb7f)",
        backgroundClip: "text",
        '-webkit-background-clip': 'text',
      }}
    >
      Regle docs
    </div>
    <span style={{ fontSize: 46, color: "#fff" }}>
      Introduction
    </span>
    <span style={{ fontSize: 26, marginTop: "10px", fontWeight: "normal", color: "#ddd" }}>
      Bla blablbalabalabalabala zifijoez fjzef zekfhzeof zejfbkez fkuebfkzefubzekfubze fzeb ffbekufbkze fuzebfkuzehfk
    </span>
  </div>
  <div style={{display: 'flex', position: 'relative'}}>
    <div style={{display: 'flex', position: "absolute",top: "50%",
      left: "50%",
      width: "200",
      height: "200",
      backgroundImage: "linear-gradient(90deg, #1aedaa, #00bb7f)",
      filter: "blur(80px)",
      transform: "translate(0%, -80%)",
      zIndex: "-1",
      borderRadius: "50%"}}>
    </div>
    <svg width={230} height={230} viewBox="0 0 501 501">
      <g>
        <path
          d="m147 110 155.1 24.6c45.2 7.1 60.4 70.6 24.3 101.4L147 388.8v-84.5L274.3 196 147 178z"
          style={{ fill: "#00bb7f" }}
        />
        <path d="m249.6 325.8 33.2 62.7h80l-58-109.7z" style={{ fill: "#fff" }} />
      </g>
    </svg>
  </div>
</div>
`;
