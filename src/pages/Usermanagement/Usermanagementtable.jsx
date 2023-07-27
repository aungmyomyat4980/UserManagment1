import React, { useState, useRef } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  message,
  Form,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { deleteUser, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import Highlighter from "react-highlight-words";
import styles from "../../styles/Usermanagementtable.module.css";
import { Helmet } from "react-helmet";

const Usermanagementtable = ({ data, loading, fetchUsers, loginUserid }) => {
  // ステート変数の定義
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedUser, setselectedUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchedData, setSearchedData] = useState(data);

  let initialUndeletedUsersCount = 0;
  if (data) {
    initialUndeletedUsersCount = data.filter(
      (user) => user.del_flg === "0"
    ).length;
  }
  const [totalFilteredRows, setTotalFilteredRows] = useState(
    initialUndeletedUsersCount
  );

  // 「検索」ボタンをクリックするか、「Enter」を押す時、検索処理
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();

    const searchTerm =
      selectedKeys[0] && typeof selectedKeys[0] === "string"
        ? selectedKeys[0].toLowerCase()
        : "";

    setSearchText(searchTerm);
    setSearchedColumn(dataIndex);

    const filteredData = data.filter((record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(searchTerm)
        : ""
    );
    if (filteredData.length === 0) {
      message.warning(Messages.M021);
    }
    setSearchedData(filteredData);
    setIsSearchActive(true);

    // Assuming that 'del_flg' property is a string
    const totalFilteredRows = filteredData.filter(
      (user) => user.del_flg === "0"
    ).length;
    setTotalFilteredRows(totalFilteredRows);
  };

  // 「キャンセル」ボタンを押す時、リセット処理
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
    setIsSearchActive(false);
    setSearchedData(data);
    setTotalFilteredRows(initialUndeletedUsersCount);
  };

  // 検索フィールドのプロパティを設定する
  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            検索
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            キャンセル
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // 編集処理
  const handleEdit = async () => {
    // Validate only the email field first
    const emailFieldError = form.getFieldError('email');
    if (emailFieldError && emailFieldError.length > 0) {
      return; // Stop execution if email field validation fails
    }

    try {
      const values = await form.validateFields();
      // Check if the email is unique among existing users
      const isEmailUnique = data.every(
        (user) => user._id === selectedUserId || user.email !== values.email
      );

      if (!isEmailUnique) {
        message.error(Messages.M003);
        return;
      }
      const userData = {
        user_name: values.firstName,
        user_name_last: values.lastName,
        email: values.email,
        user_level: values.role,
        del_flg: "0",
        create_user: selectedUser.create_user,
        create_datetime: selectedUser.create_datetime,
        update_user: loginUserid,
        update_datetime: new Date().toISOString(),
      };
      await updateUser(selectedUserId, userData);
      message.success(Messages.M008);
      handleModalCancel();
      fetchUsers();
    } catch (error) {
      message.error(Messages.M009);
      console.error("Error updating user:", error);
    }
  };

  // ユーザー編集用のモーダルを開く処理
  const handleEditUser = async (userId) => {
    form.resetFields();
    try {
      const user = await data.find((user) => user._id === userId);
      setselectedUser(user);
      form.setFieldsValue({
        firstName: user.user_name,
        lastName: user.user_name_last,
        email: user.email,
        role: user.user_level,
      });
    } catch (error) {
      console.log(error);
    }
    setEditModalShow(true);
  };

  // ユーザー削除処理
  const handleDelete = async (userId) => {
    try {
      const selectedUser = data.find((user) => user._id === userId);
      form.resetFields();
      if (selectedUser) {
        const userData = {
          user_name: selectedUser.user_name,
          user_name_last: selectedUser.user_name_last,
          email: selectedUser.email,
          user_level: selectedUser.user_level,
          del_flg: "1",
          create_user: selectedUser.create_user,
          create_datetime: selectedUser.create_datetime,
          update_user: loginUserid,
          update_datetime: new Date().toISOString(),
        };
        await deleteUser(selectedUserId, userData);
      }
      message.success(Messages.M011);
      setDeleteModalShow(false);
      fetchUsers();
    } catch (error) {
      message.success(Messages.M012);
      console.error("Error updating user:", error);
    }
    if (isSearchActive) {
      setTotalFilteredRows((prevTotal) => prevTotal - 1);
    }
  };

  // ユーザー削除用のモーダルを表示する処理
  const deleteshowModal = (userId) => {
    setSelectedUserId(userId);
    setDeleteModalShow(true);
  };

  // ユーザー編集用のモーダルを表示する処理
  const editshowModal = (userId) => {
    setSelectedUserId(userId);
    setEditModalShow(true);
    handleEditUser(userId);
  };

  // 削除モーダルの「OK」ボタン処理
  const handleModalOk = () => {
    if (selectedUserId) {
      handleDelete(selectedUserId);
    }
  };

  // モーダルのキャンセルボタン処理
  const handleModalCancel = () => {
    setDeleteModalShow(false);
    setEditModalShow(false);
  };

  // テーブルのカラム定義
  const columns = [
    {
      title: () => <div style={{ textAlign: "center" }}>番号</div>,
      dataIndex: "_id",
      key: "id",
      align: "right",
      render: (_, record, index) => {
        const pageIndex = currentPage === 1 ? 0 : (currentPage - 1) * 10;
        return pageIndex + index + 1;
      },
    },
    {
      title: () => <div style={{ textAlign: "center" }}>ユーザー名</div>,
      dataIndex: "user_name",
      key: "username",
      render: (_, record) => `${record.user_name} ${record.user_name_last}`,
    },
    {
      title: () => <div style={{ textAlign: "center" }}>メールアドレス</div>,
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", "メールアドレス"),
    },
    {
      title: () => <div style={{ textAlign: "center" }}>ユーザー権限</div>,
      dataIndex: "user_level",
      key: "role",
      sorter: (a, b) => a.user_level.localeCompare(b.user_level),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: () => <div style={{ textAlign: "center" }}>操作</div>,
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => editshowModal(record._id)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => deleteshowModal(record._id)}
          />
        </Space>
      ),
    },
  ];

  // ページネーションの変更時の処理
  const onChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    const searchTerm = searchText.toLowerCase();
    const filteredData = data.filter((record) =>
      record[searchedColumn]
        ? record[searchedColumn].toString().toLowerCase().includes(searchTerm)
        : ""
    );
    setTotalFilteredRows(
      filteredData.filter((user) => user.del_flg === "0").length
    );
  };

  // ページング数と現在のページを設定する
  const paginationConfig = {
    pageSize: 10,
    current: currentPage,
  };

  // フィルターされたデータの取得
  const filteredData = data?.filter((user) => user.del_flg === "0");

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["row-count"]} style={{ color: "green" }}>
        Total :{" "}
        {isSearchActive ? totalFilteredRows : initialUndeletedUsersCount} rows{" "}
      </div>
      <div className={styles.responsiveTable}>
        <Table
          columns={columns}
          dataSource={filteredData.map((user) => ({ ...user, key: user._id }))}
          loading={loading}
          onChange={onChange}
          pagination={paginationConfig}
          classNa00me={styles.table}
        />
      </div>
      <Modal
        centered
        open={deleteModalShow}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <p className={styles["confrimation-message"]}>{Messages.M010}</p>
      </Modal>
      <Modal
        title="Edit User"
        centered
        open={editModalShow}
        onOk={handleEdit}
        onCancel={handleModalCancel}
      >
        <Form form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label="ユーザー名[姓]"
            name="firstName"
            rules={[{ required: true, message: Messages.M013 }]}
          >
            <Input className={styles["usermanagement-input"]} disabled />
          </Form.Item>
          <Form.Item
            label="ユーザー名[名]"
            name="lastName"
            rules={[{ required: true, message: Messages.M014 }]}
          >
            <Input className={styles["usermanagement-input"]} disabled />
          </Form.Item>
          <Form.Item
            label="メールアドレス"
            name="email"
            rules={[
              { required: true, message: Messages.M002 },
              { pattern: emailRegex, message: Messages.M004 },
              {
                validator: async (_, email) => {
                  const isEmailUnique = data.every(
                    (user) => user._id === selectedUserId || user.email !== email
                  );
                  if (!isEmailUnique) {
                    throw new Error(Messages.M003);
                  }
                },
              },
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
        </Form>
      </Modal>
    </>
  );
};

export default Usermanagementtable;
