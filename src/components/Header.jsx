import React from "react";
import { Typography } from "antd";
import Logo from "../images/bp_logo_pfp.png";
import "../myCss.css";

const { Title, Text } = Typography;

// displays a page header

export default function Header({ link, title, subTitle, ...props }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem", backgroundColor: "#121212", borderBottom: "1px solid #fff", position: "fixed", top: "0", width: "100%", zIndex: "10"}}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href="/">
          <Title level={4} style={{ margin: "0 0.5rem 0 0" }}>
            <span style={{position: "absolute", top: "0px", left: "10px", fontSize: "2em"}}>
            💼
            </span>
            <span style={{position: "absolute", top: "20px", left: "70px"}}>
            The Suitcase Demo
            </span>
          </Title>
        </a>
      </div>
      {props.children}
    </div>
  );
}
