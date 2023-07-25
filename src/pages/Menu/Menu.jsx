import React from "react";
import { Button, Space } from "antd";
import { Link } from "react-router-dom";
import styles from "../../styles/Menu.module.css";
import { Helmet } from "react-helmet";

const Menu = ({ loginUsercheck }) => {
  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["menu-main"]}>
        <div className={styles["menu-container"]}>
          <div className={styles["menu-title"]}>
            <div>メニュー</div>
          </div>
          <Space
            direction="vertical"
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loginUsercheck ? (
              <Link to="/usermanagement">
                <Button
                  style={{ height: "70px", width: "350px" }}
                  type="primary"
                  block
                >
                  ユーザー管理
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                style={{ height: "70px", width: "350px" }}
                type="primary"
                block
              >
                ユーザー管理
              </Button>
            )}
            {loginUsercheck ? (
              <Link to="/teamsetting">
                <Button
                  style={{ height: "70px", width: "350px" }}
                  type="primary"
                  block
                >
                  チーム設定
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                style={{ height: "70px", width: "350px" }}
                type="primary"
                block
              >
                チーム設定
              </Button>
            )}
            <Link to="/usersearch">
              <Button
                style={{ height: "70px", width: "350px" }}
                type="primary"
                block
              >
                ユーザー検索
              </Button>
            </Link>
          </Space>
        </div>
      </div>
    </>
  );
};

export default Menu;
