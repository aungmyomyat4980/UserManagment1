import React from "react";
import styles from "../../styles/UserSearch.module.css";
import { Table } from "antd";

const UserSearchtable = ({ loading, data, loginUser }) => {
  const getSafeValue = (value, defaultValue = "") => {
    return value !== null && value !== undefined ? value : defaultValue;
  };
  const teamNameSorter = (a, b) => {
    const teamNameA = getSafeValue(a.team_name);
    const teamNameB = getSafeValue(b.team_name);
    return teamNameA.localeCompare(teamNameB);
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
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "メールアドレス",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "ユーザー権限",
      dataIndex: "user_level",
      key: "role",
      sorter: (a, b) => a.user_level.localeCompare(b.user_level),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "チーム名",
      dataIndex: "team_name",
      key: "team",
      sorter: teamNameSorter,
      sortDirections: ["ascend", "descend"],
    },
  ];

  const paginationConfig = {
    pageSize: 10,
  };

  // Filter data based on del_flg property
  const filteredData = data?.filter((user) => user.del_flg === "0");

  return (
    <>
      {loginUser[0].user_level === "member" ? (
        <Table
          columns={columns}
          dataSource={[loginUser]}
          loading={loading}
          pagination={paginationConfig}
          className={styles.table}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={paginationConfig}
          className={styles.table}
        />
      )}
    </>
  );
};

export default UserSearchtable;
