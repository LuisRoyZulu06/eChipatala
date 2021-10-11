defmodule Echipatala.ServicesTest do
  use Echipatala.DataCase

  alias Echipatala.Services

  describe "tbl_service" do
    alias Echipatala.Services.Service

    import Echipatala.ServicesFixtures

    @invalid_attrs %{consult_fee: nil, descript: nil, has_subs: nil, inst_id: nil, is_sub: nil, maker_id: nil, name: nil, parent_id: nil, status: nil}

    test "list_tbl_service/0 returns all tbl_service" do
      service = service_fixture()
      assert Services.list_tbl_service() == [service]
    end

    test "get_service!/1 returns the service with given id" do
      service = service_fixture()
      assert Services.get_service!(service.id) == service
    end

    test "create_service/1 with valid data creates a service" do
      valid_attrs = %{consult_fee: "some consult_fee", descript: "some descript", has_subs: "some has_subs", inst_id: "some inst_id", is_sub: "some is_sub", maker_id: "some maker_id", name: "some name", parent_id: "some parent_id", status: "some status"}

      assert {:ok, %Service{} = service} = Services.create_service(valid_attrs)
      assert service.consult_fee == "some consult_fee"
      assert service.descript == "some descript"
      assert service.has_subs == "some has_subs"
      assert service.inst_id == "some inst_id"
      assert service.is_sub == "some is_sub"
      assert service.maker_id == "some maker_id"
      assert service.name == "some name"
      assert service.parent_id == "some parent_id"
      assert service.status == "some status"
    end

    test "create_service/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Services.create_service(@invalid_attrs)
    end

    test "update_service/2 with valid data updates the service" do
      service = service_fixture()
      update_attrs = %{consult_fee: "some updated consult_fee", descript: "some updated descript", has_subs: "some updated has_subs", inst_id: "some updated inst_id", is_sub: "some updated is_sub", maker_id: "some updated maker_id", name: "some updated name", parent_id: "some updated parent_id", status: "some updated status"}

      assert {:ok, %Service{} = service} = Services.update_service(service, update_attrs)
      assert service.consult_fee == "some updated consult_fee"
      assert service.descript == "some updated descript"
      assert service.has_subs == "some updated has_subs"
      assert service.inst_id == "some updated inst_id"
      assert service.is_sub == "some updated is_sub"
      assert service.maker_id == "some updated maker_id"
      assert service.name == "some updated name"
      assert service.parent_id == "some updated parent_id"
      assert service.status == "some updated status"
    end

    test "update_service/2 with invalid data returns error changeset" do
      service = service_fixture()
      assert {:error, %Ecto.Changeset{}} = Services.update_service(service, @invalid_attrs)
      assert service == Services.get_service!(service.id)
    end

    test "delete_service/1 deletes the service" do
      service = service_fixture()
      assert {:ok, %Service{}} = Services.delete_service(service)
      assert_raise Ecto.NoResultsError, fn -> Services.get_service!(service.id) end
    end

    test "change_service/1 returns a service changeset" do
      service = service_fixture()
      assert %Ecto.Changeset{} = Services.change_service(service)
    end
  end
end
