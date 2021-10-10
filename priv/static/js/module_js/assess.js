
$(document).ajaxStart($.blockUI);
$(document).ready(function () {
    $(document).ajaxStop($.unblockUI);

    //------------ Switch Parent Role Selection ---------
    $('.parent_role').on('change', function (event) {
        $.blockUI();
        var parent_role_id = $('.parent_role').val();
        $.ajax({
            url: "/system/user/role",
            type: 'POST',
            data: {
                parent_role_id: parent_role_id,
                _csrf_token: $('#csrf').val()
            },
            success: function (result) {
                if (result.data) {
                    check_uncheck_permissions(result.data);

                } else {
                    Swal.fire(
                        'Oops',
                        result.info,
                        'error'
                    )
                    check_uncheck_permissions([]);
                }
            },
            error: function (request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        });
        
    });

    function check_uncheck_permissions(data) {
        data.forEach(permit => {
            $("#" + permit).prop("checked", true);
        });
    }

    $('#dt-usr-role tbody').on('click', '.change-role-status', function () {
        var button = $(this);
        var $tr = $(this).closest('tr');
        Swal.fire({
            title: "Are you sure?",
            text: "Operation will be processed",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF5350",
            confirmButtonText: "Yes, continue!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
            showLoaderOnConfirm: true
        }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: '/change/user/role/status',
                    type: 'POST',
                    data: {
                        id: button.attr("data-role-id"),
                        status: button.attr("data-role-stat"),
                        _csrf_token: $("#csrf").val()
                    },
                    success: function (result) {
                        if (result.info) {
                            if (result.info) {
                                Swal.fire(
                                    'Success',
                                    result.info,
                                    'success'
                                )
                            } else {
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                            location.reload(true);
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                            location.reload(true);
                        }
                    },
                    error: function (request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });

    var dt_usr_role = $('#dt-usr-role').DataTable({
        "paging": true
    });

    $('#dt-usr-role tbody').on('click', '.dlt-role', function () {
        var button = $(this);
        var $tr = $(this).closest('tr');
        Swal.fire({
            title: "Are you sure?",
            text: "This record will not be accessible!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF5350",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
            showLoaderOnConfirm: true
        }).then((result) => {
            if (result.value) {
                // $('.loading').show();
                $.ajax({
                    url: '/delete/user/role',
                    type: 'DELETE',
                    data: { id: button.attr("data-role-id"), _csrf_token: $("#csrf").val() },
                    success: function (result) {
                        dt_usr_role.row($tr).remove().draw(false);
                        
                        Swal.fire({
                            title: "deleted!",
                            text: "successfully deleted",
                            confirmButtonColor: "#66BB6A",
                            type: "success"
                        });
                        // location.reload(true);
                    },
                    error: function (request, msg, error) {
                        $('.loading').hide();
                        Swal.fire({
                            title: "Oops...",
                            text: "Something went wrong!",
                            confirmButtonColor: "#EF5350",
                            type: "error"
                        });
                    }
                });
            } else {
                swal({
                    title: "Cancelled",
                    text: "action not performed",
                    confirmButtonColor: "#2196F3",
                    type: "error"
                });
            }
        });
    });

});
