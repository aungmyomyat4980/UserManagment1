import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import styles from "../../styles/Usermanagement.module.css";
import Usermanagementtable from "./Usermanagementtable";
import { createUser, getUsers } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

const Usermanagement = ({ loginUser }) => {
  const [shouldResetSearch, setShouldResetSearch] = useState(false);
  // APIから取得したユーザーデータを保持する
  const [userData, setUserData] = useState([]);
  // API呼び出し中の読み込み状態を待つ
  const [loading, setLoading] = useState(false);
  // フォームインスタンスを作成する
  const [form] = Form.useForm();
  // メール検証用の正規表現
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [filteredRowCount, setFilteredRowCount] = useState(0);

  // useEffect フックを使用してコンポーネント マウントでユーザーを取得する
  useEffect(() => {
    fetchUsers();
  }, []);

  // すべてのユーザーを取得する
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setUserData(users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // userData が変更されたときにフィルター処理された行数を計算する
  useEffect(() => {
    setFilteredRowCount(userData.filter((user) => user.del_flg === "0").length);
  }, [userData]);

  // 新しいユーザーを作成するためのフォーム送信を処理する機能
  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);
      const emailExists = userData.some((user) => user.email === values.email);

      // メールがユーザーデータに既に存在するかどうか確認する
      // パラメータ : 入力したユーザーデータ
      // 戻り値 : 既にメールが存在するメッセージ
      if (emailExists) {
        form.setFields([
          {
            name: "email",
            errors: [Messages.M003],
          },
        ]);
        setLoading(false);
        return;
      }

      // 新しいユーザーを作成する
      // パラメータ : 入力したユーザーデータ
      // 戻り値 : 成功または失敗のメッセージ
      const newUserData = {
        user_name: values.firstName,
        user_name_last: values.lastName,
        email: values.email,
        user_level: values.role,
        del_flg: "0",
        team_name : "",
        create_user: loginUser[0]._id,
        create_datetime: new Date().toISOString(),
      };

      // APIを使用して新しいユーザーを作成する
      await createUser(newUserData);
      message.success(Messages.M006);

      // ユーザーを再取得し、フォームフィールドをリセットする
      fetchUsers();
      form.resetFields();
      setShouldResetSearch(true);
    } catch (error) {
      message.success(Messages.M007);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["usermanagement-form-main"]}>
        <div className={styles["usermanagement-form-container"]}>
          <Form
            form={form}
            onFinish={handleFormSubmit}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Form.Item
              label="ユーザー名[姓]"
              name="firstName"
              rules={[{ required: true, message: Messages.M013 }]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="ユーザー名[名]"
              name="lastName"
              rules={[{ required: true, message: Messages.M014 }]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="メールアドレス"
              name="email"
              rules={[
                { required: true, message: Messages.M002 },
                { pattern: emailRegex, message: Messages.M004 },
              ]}
            >
              <Input className={styles["usermanagement-input"]} />
            </Form.Item>
            <Form.Item
              label="ユーザー権限"
              name="role"
              rules={[{ required: true, message: Messages.M005 }]}
            >
              <Select
                className={styles["usermanagement-input"]}
                options={[
                  {
                    value: "admin",
                    label: "Admin",
                  },
                  {
                    value: "super admin",
                    label: "Super Admin",
                  },
                  {
                    value: "member",
                    label: "Member",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              className={styles["usermanagement-form-button-container"]}
            >
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className={styles["usermanagement-table-main"]}>
          <Usermanagementtable
            data={userData}
            loading={loading}
            fetchUsers={fetchUsers}
            loginUserid={loginUser[0]._id}
            onResetSearch = {shouldResetSearch}
          />
        </div>
      </div>
    </>
  );
};

export default Usermanagement;
