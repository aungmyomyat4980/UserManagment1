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
  // ステート変数の定義
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
  const pageSize = 6; // ページネーションの設定
  const [currentPage, setCurrentPage] = useState(1);

  // コンポーネントがマウントされたときにユーザーデータとチームデータの取得
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

  // ユーザーをクリックした際の処理
  const handleClickUser = (userId) => {
    const clickedUser = userData.find((user) => user._id === userId);

    if (clickedUser) {
      // 選択されたユーザーがすでに選択済みかどうかを確認
      const userAlreadySelected = selectedUsers.some(
        (selectedUser) => selectedUser._id === userId
      );

      // ユーザーが選択されていない場合は追加し、選択されている場合は選択解除する
      if (!userAlreadySelected) {
        setSelectedUsers((prevSelectedUsers) => [
          ...prevSelectedUsers,
          clickedUser,
        ]);
      } else {
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter((user) => user._id !== userId)
        );
      }
    }
  };

  // チーム名検索フォームの入力値を処理
  const onSearch = (value) => {
    // チーム名検索入力値の更新
    setTeamSearchInput(value);

    // 小文字検索文字列を作成
    const lowerCaseSearch = value.toLowerCase();

    // チームデータを検索して結果を更新
    const filteredTeams = teamData.filter((team) =>
      team.team_name.toLowerCase().includes(lowerCaseSearch)
    );
    setsearchteamData(filteredTeams);
  };

  // フォームのサブミット時の処理
  const handleFormSubmit = async (values) => {
    // 選択されたユーザーデータを更新
    const newUserData = clickUsers.map((user) => ({
      ...user,
      del_flg: "0",
      update_user: loginUser[0]._id,
      update_datetime: new Date().toISOString(),
      team_name: values.teamSelect,
    }));

    try {
      // 選択されたユーザーデータを更新するAPIを呼び出す
      for (const user of newUserData) {
        await updateUser(user._id, user);
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
    // 成功メッセージを表示する
    message.success(Messages.M008);

    // ユーザーデータを更新して再取得
    fetchUsers();
    //setSelectedUsers([]);
    // クリックされたユーザーデータをリセット
    setClickUsers([]);
  };

  // チーム検索のフォームサブミット時の処理
  const handleSearchSubmit = async (values) => {
    // 選択されたチームを取得し、検索値を更新する
    const selectedTeam = values.teamSelect === "なし" ? "" : values.teamSelect;
    const newSearchValue = values.teamSearchInput;

    setSearchValues((prevSearchValues) => [
      ...prevSearchValues,
      newSearchValue,
    ]);

    let filteredUserData;
    if (searchValues.includes("なし")) {
      // "なし" チームを選択している場合は、チーム名が空または選択されたチーム名を持つユーザーデータをフィルタリング
      filteredUserData = userData.filter(
        (user) => !user.team_name || searchValues.includes(user.team_name)
      );
    } else {
      // "なし" チーム以外のチームを選択している場合は、選択されたチーム名を持つユーザーデータをフィルタリング
      filteredUserData = userData.filter(
        (user) => searchValues.includes(user.team_name) && user.team_name
      );
    }

    // フィルタリングされたユーザーデータを更新する
    setUser(filteredUserData);
    // クリックされたユーザーデータをリセットする
    setClickUsers([]);
    // モーダルを非表示にする
    setIsModalVisible(false);
  };

  // 右矢印ボタンクリック時の処理
  const handleRightClick = () => {
    if (!loading) {
      // ロード中でなければ、選択されたユーザーデータをクリックされたユーザーデータに追加する
      setClickUsers((prevUsers) => {
        const uniqueSelectedUsers = selectedUsers.filter(
          (selectedUser) => !prevUsers.includes(selectedUser)
        );
        return [...prevUsers, ...uniqueSelectedUsers];
      });
      // 選択されたユーザーデータをリセットする
      setSelectedUsers([]);
    }
  };

  // 左矢印ボタンクリック時の処理
  const handleLeftClick = () => {
    if (!loading) {
      setClickUsers((prevClickUsers) => {
        const updatedClickUsers = prevClickUsers.filter(
          (user) =>
            !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
        );
        return updatedClickUsers;
      });
      // 選択されたユーザーデータをリセットする
      setSelectedUsers([]);
    }
  };

  // チェックボックスの変更時の処理
  const onChange = (e, record) => {
    if (e.target.checked) {
      // チェックがオンになった場合、選択されたチーム名を検索値に追加する
      setSearchValues((prevSearchValues) => [
        ...prevSearchValues,
        record.team_name,
      ]);
    } else {
      // チェックがオフになった場合、選択されたチーム名を検索値から削除
      setSearchValues((prevSearchValues) =>
        prevSearchValues.filter((value) => value !== record.team_name)
      );
    }
  };

  // モーダルの表示処理
  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  // テーブルのカラム定義
  const columns = [
    {
      title: "番号",
      dataIndex: "id",
      key: "id",
      render: (_, record, index) => (
        <Checkbox onChange={(e) => onChange(e, record, index)}>
          {index + 1 + (currentPage - 1) * pageSize}
        </Checkbox>
      ),
    },
    {
      title: "チーム名",
      dataIndex: "team_name",
      key: "team_name",
    },
  ];

  // ページが変更されたときに他のアクションを実行する
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // "なし" チームの静的データ
  const noneTeam = {
    id: "none",
    team_name: "なし",
  };

  // チーム検索用のデータを準備する
  let combinedTeamData;
  if (teamSearchInput.length === 0) {
    combinedTeamData = [noneTeam, ...teamData];
  } else {
    combinedTeamData = searchteamData;
  }

  // チーム選択のオプションを作成
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
              pagination={{
                pageSize,
                onChange: handlePageChange,
              }}
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
