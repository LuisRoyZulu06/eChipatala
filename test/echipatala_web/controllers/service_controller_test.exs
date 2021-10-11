defmodule EchipatalaWeb.ServiceControllerTest do
  use EchipatalaWeb.ConnCase

  import Echipatala.ServicesFixtures

  @create_attrs %{consult_fee: "some consult_fee", descript: "some descript", has_subs: "some has_subs", inst_id: "some inst_id", is_sub: "some is_sub", maker_id: "some maker_id", name: "some name", parent_id: "some parent_id", status: "some status"}
  @update_attrs %{consult_fee: "some updated consult_fee", descript: "some updated descript", has_subs: "some updated has_subs", inst_id: "some updated inst_id", is_sub: "some updated is_sub", maker_id: "some updated maker_id", name: "some updated name", parent_id: "some updated parent_id", status: "some updated status"}
  @invalid_attrs %{consult_fee: nil, descript: nil, has_subs: nil, inst_id: nil, is_sub: nil, maker_id: nil, name: nil, parent_id: nil, status: nil}

  describe "index" do
    test "lists all tbl_service", %{conn: conn} do
      conn = get(conn, Routes.service_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Tbl service"
    end
  end

  describe "new service" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.service_path(conn, :new))
      assert html_response(conn, 200) =~ "New Service"
    end
  end

  describe "create service" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.service_path(conn, :create), service: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.service_path(conn, :show, id)

      conn = get(conn, Routes.service_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Service"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.service_path(conn, :create), service: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Service"
    end
  end

  describe "edit service" do
    setup [:create_service]

    test "renders form for editing chosen service", %{conn: conn, service: service} do
      conn = get(conn, Routes.service_path(conn, :edit, service))
      assert html_response(conn, 200) =~ "Edit Service"
    end
  end

  describe "update service" do
    setup [:create_service]

    test "redirects when data is valid", %{conn: conn, service: service} do
      conn = put(conn, Routes.service_path(conn, :update, service), service: @update_attrs)
      assert redirected_to(conn) == Routes.service_path(conn, :show, service)

      conn = get(conn, Routes.service_path(conn, :show, service))
      assert html_response(conn, 200) =~ "some updated consult_fee"
    end

    test "renders errors when data is invalid", %{conn: conn, service: service} do
      conn = put(conn, Routes.service_path(conn, :update, service), service: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Service"
    end
  end

  describe "delete service" do
    setup [:create_service]

    test "deletes chosen service", %{conn: conn, service: service} do
      conn = delete(conn, Routes.service_path(conn, :delete, service))
      assert redirected_to(conn) == Routes.service_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.service_path(conn, :show, service))
      end
    end
  end

  defp create_service(_) do
    service = service_fixture()
    %{service: service}
  end
end
