defmodule Echipatala.DiseasesTest do
  use Echipatala.DataCase

  alias Echipatala.Diseases

  describe "tbl_disease" do
    alias Echipatala.Diseases.Disease

    import Echipatala.DiseasesFixtures

    @invalid_attrs %{maker_id: nil, name: nil}

    test "list_tbl_disease/0 returns all tbl_disease" do
      disease = disease_fixture()
      assert Diseases.list_tbl_disease() == [disease]
    end

    test "get_disease!/1 returns the disease with given id" do
      disease = disease_fixture()
      assert Diseases.get_disease!(disease.id) == disease
    end

    test "create_disease/1 with valid data creates a disease" do
      valid_attrs = %{maker_id: "some maker_id", name: "some name"}

      assert {:ok, %Disease{} = disease} = Diseases.create_disease(valid_attrs)
      assert disease.maker_id == "some maker_id"
      assert disease.name == "some name"
    end

    test "create_disease/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Diseases.create_disease(@invalid_attrs)
    end

    test "update_disease/2 with valid data updates the disease" do
      disease = disease_fixture()
      update_attrs = %{maker_id: "some updated maker_id", name: "some updated name"}

      assert {:ok, %Disease{} = disease} = Diseases.update_disease(disease, update_attrs)
      assert disease.maker_id == "some updated maker_id"
      assert disease.name == "some updated name"
    end

    test "update_disease/2 with invalid data returns error changeset" do
      disease = disease_fixture()
      assert {:error, %Ecto.Changeset{}} = Diseases.update_disease(disease, @invalid_attrs)
      assert disease == Diseases.get_disease!(disease.id)
    end

    test "delete_disease/1 deletes the disease" do
      disease = disease_fixture()
      assert {:ok, %Disease{}} = Diseases.delete_disease(disease)
      assert_raise Ecto.NoResultsError, fn -> Diseases.get_disease!(disease.id) end
    end

    test "change_disease/1 returns a disease changeset" do
      disease = disease_fixture()
      assert %Ecto.Changeset{} = Diseases.change_disease(disease)
    end
  end

  describe "tbl_symptom" do
    alias Echipatala.Diseases.Symptom

    import Echipatala.DiseasesFixtures

    @invalid_attrs %{category: nil, maker_id: nil, name: nil}

    test "list_tbl_symptom/0 returns all tbl_symptom" do
      symptom = symptom_fixture()
      assert Diseases.list_tbl_symptom() == [symptom]
    end

    test "get_symptom!/1 returns the symptom with given id" do
      symptom = symptom_fixture()
      assert Diseases.get_symptom!(symptom.id) == symptom
    end

    test "create_symptom/1 with valid data creates a symptom" do
      valid_attrs = %{category: "some category", maker_id: "some maker_id", name: "some name"}

      assert {:ok, %Symptom{} = symptom} = Diseases.create_symptom(valid_attrs)
      assert symptom.category == "some category"
      assert symptom.maker_id == "some maker_id"
      assert symptom.name == "some name"
    end

    test "create_symptom/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Diseases.create_symptom(@invalid_attrs)
    end

    test "update_symptom/2 with valid data updates the symptom" do
      symptom = symptom_fixture()
      update_attrs = %{category: "some updated category", maker_id: "some updated maker_id", name: "some updated name"}

      assert {:ok, %Symptom{} = symptom} = Diseases.update_symptom(symptom, update_attrs)
      assert symptom.category == "some updated category"
      assert symptom.maker_id == "some updated maker_id"
      assert symptom.name == "some updated name"
    end

    test "update_symptom/2 with invalid data returns error changeset" do
      symptom = symptom_fixture()
      assert {:error, %Ecto.Changeset{}} = Diseases.update_symptom(symptom, @invalid_attrs)
      assert symptom == Diseases.get_symptom!(symptom.id)
    end

    test "delete_symptom/1 deletes the symptom" do
      symptom = symptom_fixture()
      assert {:ok, %Symptom{}} = Diseases.delete_symptom(symptom)
      assert_raise Ecto.NoResultsError, fn -> Diseases.get_symptom!(symptom.id) end
    end

    test "change_symptom/1 returns a symptom changeset" do
      symptom = symptom_fixture()
      assert %Ecto.Changeset{} = Diseases.change_symptom(symptom)
    end
  end

  describe "tbl_disease_symptom" do
    alias Echipatala.Diseases.DiseaseSymptom

    import Echipatala.DiseasesFixtures

    @invalid_attrs %{disease_id: nil, percentage: nil, symptom_id: nil}

    test "list_tbl_disease_symptom/0 returns all tbl_disease_symptom" do
      disease_symptom = disease_symptom_fixture()
      assert Diseases.list_tbl_disease_symptom() == [disease_symptom]
    end

    test "get_disease_symptom!/1 returns the disease_symptom with given id" do
      disease_symptom = disease_symptom_fixture()
      assert Diseases.get_disease_symptom!(disease_symptom.id) == disease_symptom
    end

    test "create_disease_symptom/1 with valid data creates a disease_symptom" do
      valid_attrs = %{disease_id: "some disease_id", percentage: "some percentage", symptom_id: "some symptom_id"}

      assert {:ok, %DiseaseSymptom{} = disease_symptom} = Diseases.create_disease_symptom(valid_attrs)
      assert disease_symptom.disease_id == "some disease_id"
      assert disease_symptom.percentage == "some percentage"
      assert disease_symptom.symptom_id == "some symptom_id"
    end

    test "create_disease_symptom/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Diseases.create_disease_symptom(@invalid_attrs)
    end

    test "update_disease_symptom/2 with valid data updates the disease_symptom" do
      disease_symptom = disease_symptom_fixture()
      update_attrs = %{disease_id: "some updated disease_id", percentage: "some updated percentage", symptom_id: "some updated symptom_id"}

      assert {:ok, %DiseaseSymptom{} = disease_symptom} = Diseases.update_disease_symptom(disease_symptom, update_attrs)
      assert disease_symptom.disease_id == "some updated disease_id"
      assert disease_symptom.percentage == "some updated percentage"
      assert disease_symptom.symptom_id == "some updated symptom_id"
    end

    test "update_disease_symptom/2 with invalid data returns error changeset" do
      disease_symptom = disease_symptom_fixture()
      assert {:error, %Ecto.Changeset{}} = Diseases.update_disease_symptom(disease_symptom, @invalid_attrs)
      assert disease_symptom == Diseases.get_disease_symptom!(disease_symptom.id)
    end

    test "delete_disease_symptom/1 deletes the disease_symptom" do
      disease_symptom = disease_symptom_fixture()
      assert {:ok, %DiseaseSymptom{}} = Diseases.delete_disease_symptom(disease_symptom)
      assert_raise Ecto.NoResultsError, fn -> Diseases.get_disease_symptom!(disease_symptom.id) end
    end

    test "change_disease_symptom/1 returns a disease_symptom changeset" do
      disease_symptom = disease_symptom_fixture()
      assert %Ecto.Changeset{} = Diseases.change_disease_symptom(disease_symptom)
    end
  end
end
