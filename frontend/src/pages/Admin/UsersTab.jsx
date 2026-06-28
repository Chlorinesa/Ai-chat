import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from '../../api/admin';
import styles from './AdminPanel.module.css';

const { Option } = Select;

export default function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    const loadUsers = useCallback(async (page = 1, perPage = 5) => {
        setLoading(true);
        try {
            const response = await apiGetUsers(page, perPage);
            if (response?.data) {
                setUsers(response.data.users);
                setPagination({
                    current: response.data.page,
                    pageSize: response.data.per_page,
                    total: response.data.total
                });
            }
        } catch (error) {
            message.error('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers(pagination.current, pagination.pageSize);
    }, [loadUsers]);

    const openCreateModal = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            role: user.role,
            password: ''
        });
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            if (editingUser) {
                const updateData = {};
                if (values.username !== editingUser.username) updateData.username = values.username;
                if (values.role !== editingUser.role) updateData.role = values.role;
                if (values.password) updateData.password = values.password;

                if (Object.keys(updateData).length === 0) {
                    setModalVisible(false);
                    return;
                }

                await apiUpdateUser(editingUser.id, updateData);
                message.success('Пользователь обновлён');
            } else {
                await apiCreateUser(values.username, values.password, values.role);
                message.success('Пользователь создан');
            }

            setModalVisible(false);
            loadUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.message || 'Ошибка сохранения');
        }
    };

    const handleDelete = async (userId) => {
        try {
            await apiDeleteUser(userId);
            message.success('Пользователь удалён');
            loadUsers(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('Ошибка удаления');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60
        },
        {
            title: 'Имя пользователя',
            dataIndex: 'username',
            key: 'username',
            width: 300
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            width: 140,
            render: (role) => (
                <span className={`${styles.roleBadge} ${styles[role]}`}>
                    {role === 'admin' ? 'Админ' : 'Пользователь'}
                </span>
            )
        },
        {
            title: 'Чатов',
            dataIndex: 'chats_count',
            key: 'chats_count',
            width: 100,
            align: 'center'
        },
        {
            title: 'Сообщений',
            dataIndex: 'messages_count',
            key: 'messages_count',
            width: 190,
            align: 'center'
        },
        {
            title: 'Дата регистрации',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 140,
            render: (date) => new Date(date).toLocaleDateString('ru-RU')
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 90,
            align: 'center',
            render: (_, record) => (
                <div className={styles.actions}>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        className={styles.actionBtn}
                    />
                    <Popconfirm
                        title="Удалить пользователя?"
                        description={`${record.username} и все его данные будут удалены`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                            className={styles.actionBtn}
                        />
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className={styles.tabContent}>
            <div className={styles.toolbar}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateModal}
                    className={styles.createBtn}
                >
                    Добавить пользователя
                </Button>
            </div>

            <div className={styles.tableWrapper}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className={styles.table}
                    size="small"
                />
            </div>

            <div className={styles.paginationWrapper}>
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    pageSizeOptions={[5, 10, 15]}
                    showSizeChanger
                    onChange={(page, pageSize) => loadUsers(page, pageSize)}
                    className={styles.pagination}
                />
            </div>

            <Modal
                title={editingUser ? 'Редактирование пользователя' : 'Добавление пользователя'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                okText="Сохранить"
                cancelText="Отмена"
                className={styles.modal}
                footer={[
                    <Button key="cancel" onClick={() => setModalVisible(false)} className={styles.cancelBtn}>
                        Отмена
                    </Button>,
                    <Popconfirm
                        key="confirm"
                        title="Сохранить изменения?"
                        description="Вы уверены, что хотите сохранить изменения?"
                        onConfirm={handleModalOk}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="primary" className={styles.saveBtn}>
                            Сохранить
                        </Button>
                    </Popconfirm>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ role: 'user' }}
                >
                    <Form.Item
                        name="username"
                        label="Имя пользователя"
                        rules={[
                            { required: true, message: 'Введите имя' },
                            { min: 3, message: 'Минимум 3 символа' }
                        ]}
                    >
                        <Input placeholder="username" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Роль"
                        rules={[{ required: true }]}
                    >
                        <Select
                            dropdownStyle={{
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <Option value="user">Пользователь</Option>
                            <Option value="admin">Администратор</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
                        rules={editingUser ? [] : [
                            { required: true, message: 'Введите пароль' },
                            { min: 4, message: 'Минимум 4 символа' }
                        ]}
                    >
                        <Input.Password placeholder="••••••" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}