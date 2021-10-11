function getFormData(form){
    var unindexed_array = form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}


function formartAmount(amt) {
    return Number(amt).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


function format_value(v) {
    if(v){
        return v;
    } else{
        return "<span class='text-danger'>Not Set</span>";
    }
}

function formartAdminStatus(status) {
    var stat = null;
    if(status == "ACTIVE"){
        stat = "<span class='text-success'>ACTIVE</span>";
    }else if(status == "APPROVED"){
            return '<span class="label text-success">APPROVED</span>';
    }else if(status == "PENDING_APPROVAL"){
        stat = "<span class='text-primary'>PENDING APPROVAL</span>";
    }else if((status == "DEACTIVATED") || (status == "DELETED") || (status == "BLOCKED")){
        stat = "<span class='text-danger'>"+status+"</span>";
    }else{
        stat =status
    }
    return stat;
}

$.fn.dataTable.render.ellipsis = function ( cutoff, wordbreak, escapeHtml ) {
    var esc = function ( t ) {
        return t
            .replace( /&/g, '&amp;' )
            .replace( /</g, '&lt;' )
            .replace( />/g, '&gt;' )
            .replace( /"/g, '&quot;' );
    };
 
    return function ( d, type, row ) {
        // Order, search and type get the original data
        if ( type !== 'display' ) {
            return d;
        }
 
        if ( typeof d !== 'number' && typeof d !== 'string' ) {
            return d;
        }
 
        d = d.toString(); // cast numbers
 
        if ( d.length < cutoff ) {
            return d;
        }
 
        var shortened = d.substr(0, cutoff-1);
 
        // Find the last white space character in the string
        if ( wordbreak ) {
            shortened = shortened.replace(/\s([^\s]*)$/, '');
        }
 
        // Protect against uncontrolled HTML input
        if ( escapeHtml ) {
            shortened = esc( shortened );
        }
 
        return '<span class="ellipsis" title="'+esc(d)+'">'+shortened+'&#8230;</span>';
    };
};

//---------------- Admin approval trail modal ----------------
function approval_trial_modal(workflow){
    $('#trail').DataTable( {
        paging: false,
        info: false,
        dom: "lfrti",
        bFilter: false,
        data: workflow,
        columns: [
            {"data": "auth_level"},
            {
                "data": "initiator",
                "render": function ( initiator, type, row ) {
                    return initiator.first_name+' '+initiator.last_name;
                }
            },
            {
                "data": "approver",
                "render": function ( approver, type, row ) {
                    return (approver? approver.first_name+' '+approver.last_name : '')
                }
            },
            {
                "data": "status",
                "class": "center",
                "render": function (data, type, row) {
                    return formartAdminStatus(data)   
                }
            }
        ]
    });
    $('#approval_trial_modal').modal('show');
}

function kyc_modal(kyc){
    var modal = $('#modal_teller_kyc')
    modal.find('.modal-body #company').val(kyc.company_name);
    modal.find('.modal-body #address').val(kyc.payer_address);
    modal.find('.modal-body #email').val(kyc.payer_email);
    modal.find('.modal-body #mobile').val(kyc.payer_mobile);
    modal.find('.modal-body #name').val(kyc.payer_name);
    modal.find('.modal-body #nrc').val(kyc.payer_nrc);
    $('#modal_teller_kyc').modal('show');
}



$('#approval_trial_modal').on('hidden.bs.modal', function (event){
    $('#trail').DataTable().clear().destroy();
});



$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);
    


    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

    //-------------------- Select company under group--------------
    var link = ""
    $('.service_pay').on( 'click', function (e) {
        e.preventDefault();
        link = $(this).attr("data-url")
        var is_group = $('#is_group').val();
        if(is_group === 'TRUE'){

            if($('#has_subs').val() === 'TRUE'){
                $("#select_subsidiary").modal('show');
            }
            else{
                Swal.fire(
                    'Oops..',
                    'No subsidiaries mapped to your profile',
                    'error'
                )
            }

        }
        else{
            window.location.replace(link+'0')
        }
    });


    $('#selected_sub').on('click', function (){
        window.location.replace(link+$('#select_sub').val())
    });


    //attach profile id on each configuration item

    // $('#fee_category').on('change', function() {
    //     var code = $('#fee_category').val();
    //     var fees = $('#trans_fees').val();
    //     fees = JSON.parse(fees);
    //     console.log(fees[code])

    //     breakdown_div.style.display === "none"
    //     breakdown_div.style.display = "block"
    //     //$('#me').val(JSON.parse(acc).acc_num)
    // });

    // Client fee mapping category selection
    $('#fee_category').on('change', function () {
        var selected = $(this).val();
        if (selected != '0') {
            $('#fee_dev').show();
            $( "#map_btn" ).hide();
            $('#fee_dev div').hide();  //hide all radio buttons initially
            $('#fee_dev div.' + selected).show();  //show radio buttons with the right class
            if ($('#fee_dev div.' + selected).length){
                $( "#select_parag" ).show()
            }else{
                $( "#map_btn" ).hide();
                $( "#select_parag" ).hide();
            }
        } else {
            $('#fee_dev').hide();
            $('#fee_dev div').hide();
        }

    });
    $( "#fee_dev" ).hide();
    $( "#select_parag" ).hide();
    $( "#map_btn" ).hide();

    $('#fee_form input[type=radio]').on('click', function(){
        $( "#map_btn" ).show();
    });


    //view user modal
    $('#viewUser').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #user-input').val(button.attr("data-id"));
        modal.find('.modal-body #profile_id').val(button.attr("data-id"));
        modal.find('.modal-body #payment-input').val(button.attr("data-id"));
        modal.find('.modal-body #company_id').val(button.attr("data-id"));
    });

    //Edit branch modal
    $('#editBranch').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #id').val(button.attr("data-id"));
        modal.find('.modal-body #code').val(button.attr("data-code"));
        modal.find('.modal-body #name').val(button.attr("data-name"));
        modal.find('.modal-body #pull_acc').val(button.attr("data-pull_acc"));
        modal.find('.modal-body #pull_acc_name').val(button.attr("data-pull_acc_name"));
    });

    //Edit Currency modal
    $('#editCurrency').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #id').val(button.attr("data-id"));
        modal.find('.modal-body #code').val(button.attr("data-code"));
        modal.find('.modal-body #acronym').val(button.attr("data-acronym"));
        modal.find('.modal-body #descript').val(button.attr("data-descript"));
        modal.find('.modal-body #type').val(button.attr("data-type"));
    });


    //pass company id value to authlevel modal
    $('#authModal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #company_id').val(button.find('#company_id').val());
    });

    //redirect to users with attached profile id
    $('#map_user').on('click', function (){
        window.location.replace('/Users/Clients?id='+$('#user-input').val())
    });

    //redirect to payments with attached profile id
    $('#payment').on('click', function (){
        window.location.replace('/Payments?id='+$('#payment-input').val())
    });

    //redirect to mappings with attached profile id
    $('#mappings').on('click', function (){
        window.location.replace('/Mappings?profile_id='+$('#profile_id').val())
    });

    $('#user_role_select').on('change', function (){
        var style = this.value == "APPROVER" ? 'block' : 'none';
        document.getElementById('hidden_div').style.display = style;
    });

    //batch assessment approval modal data passing
    $('#approve_batch').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #batch_ref').val(button.attr("data-batch_ref"));
    });

    $('#decline_batch').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #ref').val(button.attr("data-batch_ref"));
    });



    //bill PRN approval modal data passing
    $('#approve_prn_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #approval_prn').val(button.attr("data-prn"));
    });

    $('#decline_prn_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #decline_prn').val(button.attr("data-prn"));

    });









    // -------------------------------------- Switch input-views
    $('#mapping_service').on('change', function() {
      //  alert( this.value ); // or $(this).val()
      if(this.value == "ZRA") {
        $('#agent_type').show();
        $('#cat1').show();
      }
      // else
      //   $('#agent_type').hide();
      //   $('#cat1').hide();
      // }
    });


    $('.remove_subsidiary_user').on( 'click', function () {
        var del = $(this);

        Swal.fire({
            title: 'Remove user from subsidiary?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/remove/subsidiary/user',
                    type: 'post',
                    data: {
                        user_id: del.attr("data-user_id"),
                        sub_id: del.attr("data-sub_id"),
                        _csrf_token: del.attr("data-csrf")
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User removed successfuly!',
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


    var user_id = $("#user_id").val();
    var tbl_system_user= $('#tbl_system_users').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No User Details to display"
        },
        "paging": true,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/system/users/table',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "name": $("#name").val(),
                "phone": $("#phone").val(),
                "email": $("#email").val(),
                "username": $("#username").val(),
                "from": $("#from").val(),
                "to": $("#to").val()
            }
        },
        "columns": [
            {"data": "name"},
            {"data": "phone"},
            {"data": "username"},
            {"data": "email"},
            {"data": "user_role"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartAdminStatus(data)   
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return user_button_options(data, row)
                }
            }
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']]
    });


    $('#btn_system_user_filter').on( 'click', function () {
        tbl_system_user.on('preXhr.dt', function ( e, settings, data ) {
            console.log(data)
            data._csrf_token = $("#csrf").val();
            data.first_name = $('#filter_name').val();
            data.last_name = $('#filter_phone').val();
            data.email = $('#filter_email').val();
            data.username = $('#filter_username').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#userfilter').modal('hide');
        tbl_system_user.draw();
    });

    $('#reload_table').on( 'click', function () {
        tbl_system_user.ajax.reload();
    });

    $('#client_admin_excel').on( 'click', function (event) {
        $('#clientSearchForm').attr('action', '/client/admin/export/excel');
        $('#clientSearchForm').attr('method', 'GET');
        $("#clientSearchForm").submit();
    });





    var user_id = $("#user_id").val();
    var tbl_client_user= $('#tbl_client_users').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Client Details to display"
        },
        "paging": true,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/Client/users/table',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "name": $("#name").val(),
                "phone": $("#phone").val(),
                "email": $("#email").val(),
                "username": $("#username").val(),
                "from": $("#from").val(),
                "to": $("#to").val()
            }
        },
        "columns": [
            {"data": "name"},
            {"data": "phone"},
            {"data": "username"},
            {"data": "email"},
            {"data": "user_role"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartAdminStatus(data)   
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return user_button_options(data, row)
                }
            }
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']]
    });


    $('#btn_system_user_filter').on( 'click', function () {
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
        $('#userfilter').modal('hide');
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

    $('#tbl_system_users tbody').on('click', '.view_details', function () {
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
        $('#tbl_system_users tbody').on('click', '.approve', function () {
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
    $('#tbl_system_users tbody').on('click', '.reset_password', function () {
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
    $('#tbl_system_users tbody').on('click', '.update_details', function () {
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
    $('#tbl_system_users tbody').on('click', '.deactivate', function () {
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
    $('#tbl_system_users tbody').on('click', '.activate', function () {
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
    $('#tbl_system_users tbody').on('click', '.unblock', function () {
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
    $('#tbl_system_users tbody').on('click', '.delete', function () {
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











    //=========================== PROFILE USERS ==============================
    //--------------------------approve------------------------------------
    $('#dt_profile_users tbody').on('click', '.approve', function () {
        Swal.fire({
            title: 'Approve Profile User?',
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

    //--------------------------activate------------------------------------
    $('#dt_profile_users tbody').on('click', '.activate', function () {
        Swal.fire({
            title: 'Activate Profile User?',
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
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Activated Succesfully!',
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

    //---------------------------deactive-------------------------------------
    $('#dt_profile_users tbody').on('click', '.deactivate', function () {

        Swal.fire({
            title: 'Deactivate Profile User?',
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
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Deactivated Succesfully!',
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

    //----------------------------Delete--------------------------------------
    $('#dt_profile_users tbody').on('click', '.delete', function () {
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
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Deleted Succesfully!',
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

    // ------------------------- reset password -------------------------------
    $('#dt_profile_users tbody').on('click', '.reset_password', function () {
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
                $.ajax({
                    url: '/Reset/User/Password',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                       "id": btn.attr("data-id"),
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

    // ------------------------- reset password -------------------------------
    $('#dt_profile_users tbody').on('click', '.unblock', function () {

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
                                'User Account Successfully Unblocked!',
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



    // ========================== BLOCK USER ACCOUNT TABLE ======================= //
    var tbl_blocked_users = $('#blocked_users_table').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Blocked Users"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/blocked/users/table',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
            }
        },
        "columns": [
            {"data": "first_name"},
            {"data": "phone"},
            {"data": "email"},
            {"data": "username"},
            {"data": "updated_at"},
            {
                "data": "id",
                "render": function (data, type, row) {
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #2196F3; color: #fff; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                    '<a href="#" data-id="'+data+'" class="dropdown-item text-info unblock_user"><i class="fal fa-unlock"></i> Unblock </a>'+
                    '</div>';
                },
            }
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
            responsive: true,
            lengthChange: false,
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
    });
    
    $('#blocked_users_table tbody').on('click', '.unblock_user', function () {
        var btn = $(this);

        Swal.fire({
            title: 'Are you sure you want to unblock this User?',
            text: "The user will recive a reset password.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Unblock!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/unblock/user',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        "user_id": btn.attr("data-id")
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                )
                                location.reload(true);   
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
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





//**************************************************email logas */

    var email_logs_dt = $('#tbl_email_logs').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        "serverSide": true,
        "paging": true,
        'ajax': {
            "type"   : "POST",
            "url"    : '/Email/Logs/Table',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "email": $('#email').val(),
                "status": $('#status').val(),
                "to": $('#to').val(),
                "from": $('#from').val()
            }
        },
        "columns": [
            {"data": "receipient_email_address"},
            {"data": "subject"},
            {"data": "email_body"},
            {"data": "status"}
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
        responsive: true,
        lengthChange: false,
        dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
    });


    $('#btn_email_filter').on( 'click', function () {
        email_logs_dt.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.email = $('#email').val();
            data.from = $('#from').val();
            data.to = $('#to').val();
            data.status = $('#status').val();
        } );

        $('#filter_mail').modal('hide');
        email_logs_dt.draw();
    });

});
