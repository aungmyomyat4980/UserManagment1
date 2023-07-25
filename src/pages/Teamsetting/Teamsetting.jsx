import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import styles from "../../styles/Teamsetting.module.css";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getTeams, getUsers, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

const Teamsetting = ({ loginUser }) => {
  const [userData, setUserData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [searchteamData, setsearchteamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [clickUsers, setClickUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState([]);
  const [teamSearchInput, setTeamSearchInput] = useState("");
  const [form] = Form.useForm();
  const [searchValues, setSearchValues] = useState([]);

  // コンポーネントがマウントされたときにユーザーデータを取得
  useEffect(() => {
    fetchUsers();
  }, []);

  // すべてのユーザーとチームを取得する
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const teams = await getTeams();
      const filteredData = users.filter((user) => user.del_flg === "0");
      const filteredTeam = teams.filter((team) => team.del_flg === "0");
      setTeamData(filteredTeam);
      setUserData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleClickUser = (userId) => {
    const clickedUser = userData.find((user) => user._id === userId);

    if (clickedUser) {
      // ユーザーがすでに selectedUsers 配列に存在するかどうかを確認する
      const userAlreadySelected = selectedUsers.some(
        (selectedUser) => selectedUser._id === userId
      );

      if (!userAlreadySelected) {
        setSelectedUsers((prevSelectedUsers) => [
          ...prevSelectedUsers,
          clickedUser,
        ]);
      } else {
        // ユーザーがすでに選択されている場合は、selectedUsers 配列から削除する
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter((user) => user._id !== userId)
        );
      }
    }
  };

  const onSearch = (value) => {
    // ユーザーが入力したときに検索入力値を更新する
    setTeamSearchInput(value);
    // Convert the search input and team names to lowercase for case-insensitive search
    const lowerCaseSearch = value.toLowerCase();
    // 検索値に基づいてteamDataをフィルタリングする
    const filteredTeams = teamData.filter((team) =>
      team.team_name.toLowerCase().includes(lowerCaseSearch)
    );
    // フィルターされたチームで searchteamData 状態を更新する
    setsearchteamData(filteredTeams);
  };

  const handleFormSubmit = async (values) => {
    const newUserData = clickUsers.map((user) => ({
      ...user, // Include the existing properties from the user object
      del_flg: "0",
      update_user: loginUser[0]._id,
      update_datetime: new Date().toISOString(),
      team_name: values.teamSelect,
    }));
    //const selectedTeam = values.teamSelect;
    try {
      for (const user of newUserData) {
        await updateUser(user._id, user);
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
    message.success(Messages.M008);
    // fetchUsers();
    setClickUsers([]);
  };

  const handleSearchSubmit = async (values) => {
    // Get the new search value from the input
    //const selectedTeam = values.teamSelect === "なし" ? "" : values.teamSelect;
    const newSearchValue = values.teamSearchInput;

    // Add the new search value to the existing searchValues array
    setSearchValues((prevSearchValues) => [
      ...prevSearchValues,
      newSearchValue,
    ]);
    // Filter the userData based on the updated searchValues array
    let filteredUserData;
    if (searchValues.includes("なし")) {
      // If "なし" is in the searchValues array, include users with no team_name
      filteredUserData = userData.filter(
        (user) => !user.team_name || searchValues.includes(user.team_name)
      );
    } else {
      // If "なし" is not in the searchValues array, only include users with the exact team_name that matches the searchValue
      filteredUserData = userData.filter(
        (user) => searchValues.includes(user.team_name) && user.team_name
      );
    }

    setUser(filteredUserData);
    setClickUsers([]);
    setIsModalVisible(false);
  };

  const handleRightClick = () => {
    if (!loading) {
      setClickUsers((prevUsers) => {
        const uniqueSelectedUsers = selectedUsers.filter(
          (selectedUser) => !prevUsers.includes(selectedUser)
        );
        return [...prevUsers, ...uniqueSelectedUsers];
      });
      setSelectedUsers([]);
    }
  };

  const handleLeftClick = () => {
    if (!loading) {
      setClickUsers((prevClickUsers) => {
        const updatedClickUsers = prevClickUsers.filter(
          (user) =>
            !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
        );
        return updatedClickUsers;
      });
      setSelectedUsers([]);
    }
  };

  const onChange = (e, record) => {
    // Toggle filter based on team_name
    if (e.target.checked) {
      // Checkbox is checked, add the team_name to the search value
      setSearchValues((prevSearchValues) => [
        ...prevSearchValues,
        record.team_name,
      ]);
    } else {
      // Checkbox is unchecked, remove the team_name from the search value
      setSearchValues((prevSearchValues) =>
        prevSearchValues.filter((value) => value !== record.team_name)
      );
    }
  };

  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "番号",
      dataIndex: "id",
      key: "id",
      render: (_, record) => <Checkbox onChange={(e) => onChange(e, record)} />,
    },
    {
      title: "チーム名",
      dataIndex: "team_name",
      key: "team_name",
    },
  ];

  // Static data for "なし" team
  const noneTeam = {
    id: "none",
    team_name: "なし",
  };

  let combinedTeamData;
  if (teamSearchInput.length === 0) {
    combinedTeamData = [noneTeam, ...teamData];
  } else {
    combinedTeamData = searchteamData;
  }

  const paginationConfig = {
    pageSize: 6,
  };

  const teamOptions = teamData.map((team) => ({
    value: team.team_name,
    label: team.team_name,
  }));

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["teamsetting-main"]}>
        <div className={styles["teamsetting-container"]}>
          <div className={styles["teamsetting-search"]}>
            <label className={styles["teamsetting-label"]}>チーム名 : </label>
            <SearchOutlined
              style={{
                background: "blue",
                color: "#fff",
                padding: "5px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "5px",
                marginLeft: "5px",
              }}
              onClick={handleShowModal}
            />
          </div>
          <Modal
            title="チーム名検索"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            centered
          >
            <Form>
              <Form.Item label="チーム名">
                <Input
                  style={{ width: "100%" }}
                  placeholder="検索条件入力"
                  name="teamSearchInput"
                  value={teamSearchInput}
                  onChange={(e) => onSearch(e.target.value)} // Connect the onChange event
                />
              </Form.Item>
            </Form>
            <Table
              dataSource={combinedTeamData}
              columns={columns}
              rowKey="id"
              pagination={paginationConfig}
            />
            <Form.Item style={{ textAlign: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={handleSearchSubmit}
              >
                追加
              </Button>
            </Form.Item>
          </Modal>
          <Form form={form} onFinish={handleFormSubmit}>
            <Form.Item
              name="teamSelect"
              label="チームに移動"
              className={styles["usermanagement-form-item"]}
              rules={[
                {
                  required: true,
                  message: "チームを選択してください", // Error message when the select box is not chosen
                },
              ]}
            >
              <Select
                style={{ width: "250px" }}
                className={styles["usermanagement-input"]}
                options={teamOptions}
              />
            </Form.Item>
            <Form.Item
              label="ユーザー名"
              className={styles["username-form-item"]}
            >
              <div className={styles["teamsetting-box-main"]}>
                <div className={styles["teamsetting-box-container"]}>
                  <div className={styles["teamsetting-box"]}>
                    {loading ? (
                      <div>Loading...</div>
                    ) : (
                      <>
                        {user?.map((user) => (
                          <div
                            onClick={() => handleClickUser(user._id)}
                            className={`${styles["teamsetting-user"]} ${
                              clickUsers.find(
                                (clickedUser) => clickedUser._id === user._id
                              )
                                ? styles["none"]
                                : ""
                            } ${
                              selectedUsers.find(
                                (selectedUser) => selectedUser._id === user._id
                              )
                                ? styles["selected"]
                                : ""
                            }`}
                            key={user?._id}
                          >
                            <div>{`${user.user_name} ${user.user_name_last}`}</div>
                            <div>{user.email}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className={styles["teamsetting-btn-main"]}>
                  <div
                    className={styles["teamsetting-btn-container"]}
                    onClick={handleRightClick}
                  >
                    <DoubleRightOutlined
                      className={styles["teamsetting-btn"]}
                    />
                  </div>
                  <div
                    className={styles["teamsetting-btn-container"]}
                    onClick={handleLeftClick}
                  >
                    <DoubleLeftOutlined className={styles["teamsetting-btn"]} />
                  </div>
                </div>
                <div className={styles["teamsetting-box-container"]}>
                  <div className={styles["teamsetting-box"]}>
                    {clickUsers?.map((user) => (
                      <div
                        className={`${styles["teamsetting-user"]} ${
                          selectedUsers.some(
                            (selectedUser) => selectedUser._id === user._id
                          )
                            ? styles["selected"]
                            : ""
                        }`}
                        onClick={() => handleClickUser(user._id)}
                        key={user?._id}
                      >
                        <div>{`${user.user_name} ${user.user_name_last}`}</div>
                        <div>{user.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Form.Item>
            <Form.Item
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                disabled={clickUsers.length === 0}
              >
                決定
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Teamsetting;
