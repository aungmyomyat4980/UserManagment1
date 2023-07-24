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
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedUser, setselectedUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [emptySearchResults, setEmptySearchResults] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  
    const searchTerm = selectedKeys[0] ? selectedKeys[0].toLowerCase() : ""; // Check if selectedKeys[0] is defined
  
    const filteredData = data.filter((record) =>
      record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(searchTerm) : ""
    );
  
    setEmptySearchResults(filteredData.length === 0);
  
    if (filteredData.length === 0) {
      message.warning("データが見つかりません");
    }
  };  

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

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

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
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
      const editUser = await updateUser(selectedUserId, userData);
      console.log("editdata", editUser);

      message.success(Messages.M008);
      handleModalCancel();
      fetchUsers();
    } catch (error) {
      message.error(Messages.M009);
      console.error("Error updating user:", error);
    }
  };

  const handleEditUser = async (userId) => {
    form.resetFields();
    try {
      const user = await data.find((user) => user._id === userId);
      setselectedUser(user);
      console.log("selecteduser", user);
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
  };

  const deleteshowModal = (userId) => {
    setSelectedUserId(userId);
    setDeleteModalShow(true);
  };

  const editshowModal = (userId) => {
    setSelectedUserId(userId);
    setEditModalShow(true);
    handleEditUser(userId);
  };

  const handleModalOk = () => {
    if (selectedUserId) {
      handleDelete(selectedUserId);
    }
  };

  const handleModalCancel = () => {
    setDeleteModalShow(false);
    setEditModalShow(false);
  };

  const columns = [
    {
      title: "番号",
      dataIndex: "_id",
      key: "id",
      render: (_, record, index) => index + 1,
    },
    {
      title: "ユーザー名",
      dataIndex: "user_name",
      key: "username",
      render: (_, record) => `${record.user_name} ${record.user_name_last}`,
    },
    {
      title: "メールアドレス",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email", "メールアドレス"),
    },
    {
      title: "ユーザー権限",
      dataIndex: "user_level",
      key: "role",
      sorter: (a, b) => a.user_level.localeCompare(b.user_level),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "操作",
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

  const paginationConfig = {
    pageSize: 10,
  };

  // Filter data based on del_flg property
  const filteredData = data?.filter((user) => user.del_flg === "0");

  return (
    <>
    <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
    </Helmet>
    <Table
        columns={columns}
        dataSource={filteredData.map((user) => ({ ...user, key: user._id }))}
        loading={loading}
        pagination={paginationConfig}
        className={styles.table}
      />
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
            <Input className={styles["usermanagement-input"]} disabled  />
          </Form.Item>
          <Form.Item
            label="ユーザー名[名]"
            name="lastName"
            rules={[{ required: true, message: Messages.M014 }]}
          >
            <Input className={styles["usermanagement-input"]} disabled  />
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
        </Form>
      </Modal>
    </>
  );
};

export default Usermanagementtable;
