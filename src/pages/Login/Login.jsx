import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Messages } from "../../data/message";
import styles from "../../styles/Login.module.css";
import { getUsers } from "../../api/api";
import { Helmet } from "react-helmet";

const Login = ({ onLogin, setLoginUsercheck }) => {
  // ユーザーデータの状態を管理するState変数
  const [userData, setUserData] = useState([]);
  // ユーザー名とパスワードのState変数
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // ログインメッセージのState変数
  const [message, setMessage] = useState("");

  // コンポーネントがマウントされたときにユーザーデータを取得
  useEffect(() => {
    fetchUsers();
  }, []);

  // すべてのユーザーを取得する
  const fetchUsers = async () => {
    try {
      const users = await getUsers();
      setUserData(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 削除されていないユーザーデータのみをフィルタリング
  const filteredData = userData?.filter((user) => user.del_flg === "0");

  // 特定のユーザーレベルのユーザーのみをフィルタリング
  const users = filteredData?.filter(
    (user) =>
      user.user_level === "admin" ||
      user.user_level === "super admin" ||
      user.user_level === "member"
  );

  // react-routerのuseNavigateフックを使用して、画面遷移を行う
  const navigate = useNavigate();

  // ログインフォームが送信されたときのハンドラー機能
  const handleSubmit = (values) => {
    const { username } = values;

    // フィルタリングされたユーザーデータから該当のユーザーを見つける
    const user = users.find((user) => {
      const fullName = `${user.user_name} ${user.user_name_last}`;
      return fullName === username;
    });

    // 該当のユーザーが存在し、かつ管理者またはスーパー管理者の場合
    if (
      user &&
      (user.user_level === "admin" || user.user_level === "super admin")
    ) {
      setLoginUsercheck(true);
    } else {
      setLoginUsercheck(false);
    }

    // 該当のユーザーが存在し、かつ管理者、スーパー管理者、またはメンバーの場合
    if (
      user &&
      (user.user_level === "admin" ||
        user.user_level === "super admin" ||
        user.user_level === "member")
    ) {
      setMessage("ログイン成功");

      // 入力したフィールドをクリアする
      setUsername("");
      setPassword("");
      onLogin(
        user.email,
        user._id,
        user.user_level,
        user.user_name,
        user.user_name_last,
        user.team_name
      );
      navigate("/menu");
    } else {
      setMessage("ユーザー名とパスワードが間違っています。");
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["login-form-main"]}>
        <div className={styles["login-form-container"]}>
          <Form
            initialValues={{
              remember: true,
            }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: Messages.M018,
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="ユーザー名"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: Messages.M019,
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="パスワード"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles["login-form-button"]}
              >
                ログイン
              </Button>
            </Form.Item>
            <p className={styles["login-form-err-message"]}>{message}</p>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
