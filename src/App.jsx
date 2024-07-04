import {
  Button,
  Flex,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import "./App.css";
import { useEffect } from "react";
import { useState } from "react";

function App() {
  const modelURL = "https://autoapi.dezinfeksiyatashkent.uz/api/models";
  const brandsURL = "https://autoapi.dezinfeksiyatashkent.uz/api/brands";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTczNzkzNTUtZDNjYi00NzY1LTgwMGEtNDZhOTU1NWJiOWQyIiwidG9rZW5fdHlwZSI6ImFjY2VzcyIsImlhdCI6MTcyMDA4MzQ5OCwiZXhwIjoxNzUxNjE5NDk4fQ.9EjhKLWUOrgxnU2PAH6xxUvrzNyYzYkYsjhInx2V2OA";
  const [loader, setLoader] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form] = Form.useForm();

  const [editID, setEditID] = useState(null);
  const [deleteID, setDeleteID] = useState(null);

  // GET
  const [data, setData] = useState([]);
  const getData = () => {
    setLoader(true);
    fetch(modelURL)
      .then((res) => res.json())
      .then((data) => {
        setData(data.data);
      })
      .catch((err) => message.error(err))
      .finally(() => setLoader(false));
  };

  useEffect(() => {
    getData();
  }, []);

  // Get Brand data
  const [brandData, setBrandData] = useState([]);
  const getBrandData = () => {
    fetch(brandsURL)
      .then((res) => res.json())
      .then((data) => {
        setBrandData(data.data);
      })
      .catch((err) => message.error(err))
      .finally(() => setLoader(false));
  };

  useEffect(getBrandData, []);

  // Delete
  const deleteModel = () => {
    fetch(`${modelURL}/${deleteID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        getData();
        message.success("Model was deleted successfully");
      })
      .catch((err) => message.error(err));
  };

  const optionsData =
    brandData &&
    brandData.map((brand) => ({
      label: brand.title,
      value: brand.id,
    }));

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: (
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Add brand
        </Button>
      ),
      dataIndex: "add-brand",
      key: "add-brand",
    },
  ];

  const dataSource =
    data &&
    data.map((model) => ({
      key: model.id,
      name: model.name,
      brand: model.brand_title,
      action: (
        <Flex gap="small">
          <Button
            type="primary"
            onClick={() => {
              setEditID(model.id);
              form.setFieldsValue({ name: model.name, brand: model.brand_id });
              setEditModal(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this task?"
            onConfirm={deleteModel}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger onClick={() => setDeleteID(model.id)}>
              Delete
            </Button>
          </Popconfirm>
        </Flex>
      ),
    }));

  // POST
  const [model, setModel] = useState(null);
  const [brand, setBrand] = useState(null);
  const postData = () => {
    const formData = new FormData();
    formData.append("name", model);
    formData.append("brand_id", brand);
    fetch(modelURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          getData();
          message.success(data.message);
          setIsModalOpen(false);
          form.resetFields();
        } else {
          message.error("Something went wrong!");
        }
      })
      .catch((err) => message.error(err));
  };

  // EDIT
  const getEditData = brandData?.filter((brand) => brand.id === editID)[0];
  const [editName, setEditName] = useState(null);
  const [editBrand, setEditBrand] = useState(null);

  const editData = () => {
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("brand_id", editBrand);

    fetch(`${modelURL}/${editID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          getData();
          message.success(data.message);
          setEditModal(false);
        } else {
          message.error("Something went wrong!");
        }
      })
      .catch((err) => message.error(err));
  };

  return (
    <div className="App container">
      <Table
        loading={loader ? true : false}
        dataSource={dataSource}
        columns={columns}
      />
      {/* Add brand modal */}
      <Modal
        title="Add Brand"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
          layout="vertical"
          onFinish={postData}
        >
          <Form.Item
            label="Model name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <Input onChange={(e) => setModel(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Brand name"
            name="brand"
            rules={[
              {
                required: true,
                message: "Please input your brand!",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Select a model"
              optionFilterProp="label"
              options={optionsData}
              onChange={(e) => setBrand(e)}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Flex gap="small">
              <Button htmlType="submit" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit brand modal */}
      <Modal
        title="Edit Model"
        open={editModal}
        onOk={() => setEditModal(false)}
        onCancel={() => setEditModal(false)}
        footer={null}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{
            remember: true,
          }}
          autoComplete="off"
          layout="vertical"
          onFinish={editData}
        >
          <Form.Item
            label="Model name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
            initialValue={getEditData?.title}
          >
            <Input onChange={(e) => setEditName(e.target.value)} />
          </Form.Item>

          <Form.Item
            label="Brand name"
            name="brand"
            rules={[
              {
                required: true,
                message: "Please input your brand!",
              },
            ]}
            initialValue={getEditData?.id}
          >
            <Select
              showSearch
              placeholder="Select a model"
              optionFilterProp="label"
              options={optionsData}
              onChange={(e) => setEditBrand(e)}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Flex gap="small">
              <Button htmlType="submit" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
