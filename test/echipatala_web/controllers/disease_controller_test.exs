defmodule EchipatalaWeb.DiseaseControllerTest do
  use EchipatalaWeb.ConnCase

  import Echipatala.DiseasesFixtures

  @create_attrs %{maker_id: "some maker_id", name: "some name"}
  @update_attrs %{maker_id: "some updated maker_id", name: "some updated name"}
  @invalid_attrs %{maker_id: nil, name: nil}

  describe "index" do
    test "lists all tbl_disease", %{conn: conn} do
      conn = get(conn, Routes.disease_path(conn, :index))
      assert html_response(conn, 200) =~ "Listing Tbl disease"
    end
  end

  describe "new disease" do
    test "renders form", %{conn: conn} do
      conn = get(conn, Routes.disease_path(conn, :new))
      assert html_response(conn, 200) =~ "New Disease"
    end
  end

  describe "create disease" do
    test "redirects to show when data is valid", %{conn: conn} do
      conn = post(conn, Routes.disease_path(conn, :create), disease: @create_attrs)

      assert %{id: id} = redirected_params(conn)
      assert redirected_to(conn) == Routes.disease_path(conn, :show, id)

      conn = get(conn, Routes.disease_path(conn, :show, id))
      assert html_response(conn, 200) =~ "Show Disease"
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, Routes.disease_path(conn, :create), disease: @invalid_attrs)
      assert html_response(conn, 200) =~ "New Disease"
    end
  end

  describe "edit disease" do
    setup [:create_disease]

    test "renders form for editing chosen disease", %{conn: conn, disease: disease} do
      conn = get(conn, Routes.disease_path(conn, :edit, disease))
      assert html_response(conn, 200) =~ "Edit Disease"
    end
  end

  describe "update disease" do
    setup [:create_disease]

    test "redirects when data is valid", %{conn: conn, disease: disease} do
      conn = put(conn, Routes.disease_path(conn, :update, disease), disease: @update_attrs)
      assert redirected_to(conn) == Routes.disease_path(conn, :show, disease)

      conn = get(conn, Routes.disease_path(conn, :show, disease))
      assert html_response(conn, 200) =~ "some updated maker_id"
    end

    test "renders errors when data is invalid", %{conn: conn, disease: disease} do
      conn = put(conn, Routes.disease_path(conn, :update, disease), disease: @invalid_attrs)
      assert html_response(conn, 200) =~ "Edit Disease"
    end
  end

  describe "delete disease" do
    setup [:create_disease]

    test "deletes chosen disease", %{conn: conn, disease: disease} do
      conn = delete(conn, Routes.disease_path(conn, :delete, disease))
      assert redirected_to(conn) == Routes.disease_path(conn, :index)

      assert_error_sent 404, fn ->
        get(conn, Routes.disease_path(conn, :show, disease))
      end
    end
  end

  defp create_disease(_) do
    disease = disease_fixture()
    %{disease: disease}
  end
end
