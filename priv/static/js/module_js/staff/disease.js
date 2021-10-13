$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);
    


    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );


    var user_id = $("#user_id").val();
    var tbl_disease_table= $('#tbl_disease_mngt').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Disease Details to display"
        },
        "paging": true,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/Disease/Management/table',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "name": $("#name").val(),
                "description": $("#description").val(),
                // "from": $("#from").val(),
                // "to": $("#to").val()
            }
        },
        "columns": [
            {"data": "name"},
            {"data": "description"},
            {"data": "maker_id"},
            {
                "data": "id",
                "render": function (data, type, row) {
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: rgb(128, 0, 32); color: #fff; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                    '<a href="#" data-id="'+data+'" class="dropdown-item text-info unblock_user"><i class="fal fa-edit"></i> Edit </a>'+
                    '<a href="#" data-id="'+data+'" class="dropdown-item text-info unblock_user"><i class="fal fa-plus"></i> Add Symptoms </a>'+
                    '</div>';
                },
            }
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']]
    });


    $('#btn_disease_filter').on( 'click', function () {
        tbl_disease_table.on('preXhr.dt', function ( e, settings, data ) {
            console.log(data)
            data._csrf_token = $("#csrf").val();
            data.first_name = $('#filter_name').val();
            data.last_name = $('#filter_phone').val();
            data.email = $('#filter_email').val();
            data.username = $('#filter_username').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#diseasefilter').modal('hide');
        tbl_disease_table.draw();
    });

    $('#reload_table').on( 'click', function () {
        tbl_disease_table.ajax.reload();
    });

    $('#client_admin_excel').on( 'click', function (event) {
        $('#clientSearchForm').attr('action', '/client/admin/export/excel');
        $('#clientSearchForm').attr('method', 'GET');
        $("#clientSearchForm").submit();
    });



    $('#btn_disease_filter').on( 'click', function () {
        tbl_client_user.on('preXhr.dt', function ( e, settings, data ) {
            console.log(data)
            data._csrf_token = $("#csrf").val();
            data.first_name = $('#filter_name').val();
            data.last_name = $('#filter_phone').val();
            data.email = $('#filter_email').val();
            data.username = $('#filter_username').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#diseasefilter').modal('hide');
        tbl_client_user.draw();
    });

    $('#reload_table').on( 'click', function () {
        tbl_client_user.ajax.reload();
    });

    $('#client_admin_excel').on( 'click', function (event) {
        $('#clientSearchForm').attr('action', '/client/admin/export/excel');
        $('#clientSearchForm').attr('method', 'GET');
        $("#clientSearchForm").submit();
    });

    function view_user(result){
        console.log(result)
        var data = result.data
        var modal = $('#user_details')

        modal.find('.modal-body #username').text(data.username);
        modal.find('.modal-body #first_name').text(data.first_name);
        modal.find('.modal-body #last_name').text(data.last_name);
        modal.find('.modal-body #phone').text(data.phone);
        modal.find('.modal-body #email').text(data.email);
        modal.find('.modal-body #id_no').text(data.id_no);
        modal.find('.modal-body #id_type').text(data.id_type);
        modal.find('.modal-body #user_role').text(data.user_role);
        $('#user_details').modal('show');
    }

    $('#tbl_disease_tables tbody').on('click', '.view_details', function () {
        $.blockUI();
		$.ajax({
            url: "/User/details",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"),
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    view_user(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        })
    });

        //--------------------------approve------------------------------------
        $('#tbl_disease_tables tbody').on('click', '.approve', function () {
            Swal.fire({
                title: 'Approve System User?',
                text: "You won't be able to revert this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue!',
                showLoaderOnConfirm: true
                }).then((result) => {
                if (result.value) {
                    $.blockUI();
                    $.ajax({
                        url: '/approve/user',
                        type: 'post',
                        data: {
                            _csrf_token: $('#csrf').val(),
                            id: $(this).attr("data-id"),
                        },
                        success: function(result) {
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    'User Approved Succesfully!',
                                    'success'
                                )
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
                        error: function(request, msg, error) {
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

    //-------------------------- Reset Password-------------------------------
    $('#tbl_disease_tables tbody').on('click', '.reset_password', function () {
        var btn = $(this);

        Swal.fire({
            title: 'Reset User Password?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: '/Reset/User/Password',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                       "id": btn.attr("data-id"),
                        "email": btn.attr("data-email"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Password Succesfully Reset!',
                                'success'
                            )
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
                    error: function(request, msg, error) {
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

    //---------------------------- Edit --------------------------------
    $('#tbl_disease_tables tbody').on('click', '.update_details', function () {
        $.blockUI();
		$.ajax({
            url: "/User/details",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"),
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    console.log(result.data)
                    edit_user_modal(result.data)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        })
    });

    function edit_user_modal(data) {
        var modal = $('#edit_system_user_modal');
        modal.find('.modal-body #id').val(data.id);
        modal.find('.modal-body #first_name').val(data.first_name);
        modal.find('.modal-body #last_name').val(data.last_name);
        modal.find('.modal-body #id_no').val(data.id_no);
        modal.find('.modal-body #phone').val(data.phone);
        modal.find('.modal-body #email').val(data.email);
        modal.find('.modal-body #user_type').val(data.user_type);
        modal.modal('show');
    };

    //--------------------------Deactivate-------------------------
    $('#tbl_disease_tables tbody').on('click', '.deactivate', function () {
        Swal.fire({
            title: 'Deactivate User Account?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: '/deactivate/user',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                       "id": $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Account Succesfully Deactivated',
                                'success'
                            )
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
                    error: function(request, msg, error) {
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

    //--------------------------Activate-----------------------------------
    $('#tbl_disease_tables tbody').on('click', '.activate', function () {
        Swal.fire({
            title: 'Activate User Account?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: '/activate/user',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                       "id": $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Account Succesfully Activated',
                                'success'
                            )
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
                    error: function(request, msg, error) {
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

    //--------------------------Unblock-----------------------------------
    $('#tbl_disease_tables tbody').on('click', '.unblock', function () {
        Swal.fire({
            title: 'Unblock User Account?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: '/unblock/user',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                       "id": $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Succesfully Unblocked',
                                'success'
                            )
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
                    error: function(request, msg, error) {
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

    //--------------------------Delete--------------------------------------
    $('#tbl_disease_tables tbody').on('click', '.delete', function () {
        var btn = $(this);
        Swal.fire({
            title: 'Delete User Account?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: '/delete/user',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        "id": btn.attr("data-id")
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'System User Succesfully Deleted',
                                'success'
                            )
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
                    error: function(request, msg, error) {
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


});
