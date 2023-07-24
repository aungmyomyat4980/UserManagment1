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

  // ユーザーデータを取得する関数
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
  console.log("filterdData", filteredData);

  // 特定のユーザーレベルのユーザーのみをフィルタリング
  const users = filteredData?.filter(
    (user) =>
      user.user_level === "admin" ||
      user.user_level === "super admin" ||
      user.user_level === "member"
  );
  
  // react-routerのuseNavigateフックを使用して、画面遷移を行うための関数
  const navigate = useNavigate();

  // ログインフォームが送信されたときのハンドラー関数
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
      setLoginUsercheck(true); // ログインフラグを設定
    } else {
      setLoginUsercheck(false); // ログインフラグを設定
    }

    // 該当のユーザーが存在し、かつ管理者、スーパー管理者、またはメンバーの場合
    if (
      user &&
      (user.user_level === "admin" ||
        user.user_level === "super admin" ||
        user.user_level === "member")
    ) {
      setMessage("ログイン成功");

      // 入力フィールドをクリア
      setUsername("");
      setPassword("");

      // ログイン成功時に親コンポーネントにユーザーデータを渡し、画面遷移を行う
      onLogin(
        user.email,
        user._id,
        user.user_level,
        user.user_name,
        user.user_name_last,
        user.team_name
      );
      navigate("/menu"); // "/menu"への画面遷移
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
          onFinish={handleSubmit} // フォームが送信されたときにhandleSubmit関数を実行
        >
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: Messages.M018, // 入力がない場合に表示するエラーメッセージ
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="ユーザー名"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // ユーザー名の入力変更時にState変数を更新
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: Messages.M019, // 入力がない場合に表示するエラーメッセージ
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="パスワード"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // パスワードの入力変更時にState変数を更新
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
          <p className={styles["login-form-err-message"]}>{message}</p> {/* エラーメッセージを表示 */}
        </Form>
      </div>
    </div>
    </>
  );
};

export default Login;
