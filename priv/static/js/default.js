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









    //------------resend token---------
    $('.resend_token').on( 'click', function (event) {
        Swal.fire({
            title: 'Proceed to resend token?',
            text: "Resend approval token for this transaction",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/Smartpay/notifications/resend_token",
                    type: 'POST',
                    data: {
                        ref_id: $('#ref_id').val(),
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                )
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                            //location.reload(true);
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


   

  //-----------Unmap User From Fee--------
  $('.delete_fee_mapping').on( 'click', function () {
    var del = $(this);

    Swal.fire({
        title: 'Unmap User From Fee?',
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
                url: '/Remove/Clients/under/fee',
                type: 'post',
                data: {
                    id: del.attr("data-id"),
                    _csrf_token: del.attr("data-csrf")
                },
                success: function(result) {
                    if (result.data){
                        Swal.fire(
                            'Success',
                            'User Unmaped From Fee Succesfully!',
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




  //-----------Delete Department--------
  $('.delete_department').on( 'click', function () {
    var del = $(this);

    Swal.fire({
        title: 'Delet Department?',
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
                url: '/Delete/Department/Details',
                type: 'post',
                data: {
                    id: del.attr("data-id"),
                    _csrf_token: del.attr("data-csrf")
                },
                success: function(result) {
                    if (result.data){
                        Swal.fire(
                            'Success',
                            'Department Deleted Succesfully!',
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



//============================= CLIENT MANAGEMENT TABLE ==============================
function profile_button_options(data, row){
    var init_btn ='<button class="btn bg-fusion-100 waves-effect waves-themed btn-xs" data-toggle="dropdown">Options</button>'+
    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
    var dtls_btn = '<a href="/Profile/Configuarations?id='+data+'" class="dropdown-item text-info"><i class="fal fa-align-left"></i> Details </a>';
    var deact_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-warning deactivate"><i class="fal fa-ban"></i> Deactivate</a>';
    var del_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete"><i class="fal fa-trash"></i> Delete </a>';
    var act_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success activate" ><i class="fal fa-check"></i> Activate </a>';
    var aprv_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-info approve"><i class="fal fa-check"></i>Approve</a>';

    var status = row.status

    if(status == "PENDING_APPROVAL" && user_id == row.creator_id){
        return init_btn+dtls_btn+deact_btn+del_btn+'</div>'
    }else if(status == "PENDING_APPROVAL" && user_id != row.creator_id){
        return init_btn+dtls_btn+aprv_btn+'</div>'
    }else if(status == "ACTIVE"){
        return init_btn+dtls_btn+deact_btn+del_btn+'</div>';
    }else if(status == "DEACTIVATED"){
        return init_btn+dtls_btn+act_btn+del_btn+'</div>';
    }else{
        return '<span class="text-danger">No Actions</span>'; 
    }
}

var user_id = $("#user_id").val();
var tbl_client_profiles = $('#client_profiles').DataTable({
    "select": {
        "style": 'multi'
    },
    "responsive": true,
    "processing": true,
    'language': {
        'loadingRecords': '&nbsp;',
        processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
        "emptyTable": "No Client's to display"
    },
    "paging": true,
    "pageLength": 10,
    "serverSide": true,
    "ajax": {
        "type"   : "POST",
        "url"    : '/client/Profiles',
        "data"   : {
            "_csrf_token": $("#csrf").val(),
        }
    },
    "columns": [
        {"data": "name"},
        {"data": "phone"},
        {"data": "email"},
        {"data": "client_type"},
        {
            "data": "status",
            "class": "center",
            "render": function (data, type, row) {
                return formartAdminStatus(data)   
            }
        },
        {
            "data": "id",
            "render": function (data, type, row) {
                return profile_button_options(data, row);   
            },
            "defaultContent": "<span class='text-danger'>Not Set</span>"
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

    //-------------------------- Approve --------
    $('#client_profiles tbody').on('click', '.approve', function () {
        var btn = $(this);
        Swal.fire({
            title: 'Approve Client Profile?',
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
                    url: '/approve/Profile',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: btn.attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Client Profile Approved Succesfully!',
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

    //-------------------------- Deactivate ------------------/
    $('#client_profiles tbody').on('click', '.deactivate', function () {
        var btn = $(this);

        Swal.fire({
            title: 'Deactivate Client Profile?',
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
                    url: '/deactivate/profile',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                    "id": btn.attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Client Profile Succesfully Deactivated',
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

    //-------------------------- Activate ------------------/
    $('#client_profiles tbody').on('click', '.activate', function () {
        var btn = $(this);

        Swal.fire({
            title: 'Activate Client Profile?',
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
                    url: '/activate/profile',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                    "id": btn.attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Client Profile Succesfully Activated',
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

    //-------------------------- Delete ------------------/
    $('#client_profiles tbody').on('click', '.delete', function () {
        var btn = $(this);

        Swal.fire({
            title: 'Delete Client Profile?',
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
                    url: '/delete/profile',
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                    "id": btn.attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Client Profile Succesfully Deleted',
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











    //=========================== SUBSIDIARIES ==============================
    $('#dt_subsidaries tbody').on('click', '.approve', function () {
        var btn = $(this);
        Swal.fire({
            title: 'Approve Subsidiary Profile?',
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
                    url: '/approve/Profile',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: btn.attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Client Profile Approved Succesfully!',
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








    //============================= BANK USERS TABLE =======================================
    function user_button_options(data, row){
        var init_btn ='<button class="btn bg-fusion-100 waves-effect waves-themed btn-xs" data-toggle="dropdown">Options</button>'+
        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
        var dtls_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_details"><i class="fal fa-eye"></i> View </a>';
        var edt_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-info update_details"><i class="fal fa-edit"></i> Edit </a>';
        var aprv_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success approve" ><i class="fal fa-check"></i> Approve </a>';
        var act_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success activate" ><i class="fal fa-check"></i> Activate </a>';
        var del_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete"><i class="fal fa-trash"></i> Delete </a>';
        var rst_pas_btn = '<a href="#" data-id="'+data+'" data-email="'+data+'" class="dropdown-item text-info reset_password" ><i class="fal fa-watch"></i> Reset Password </a>';
        var deact_btn = '<a href="#" data-id="'+data+'" data-username="'+data+'" class="dropdown-item text-warning deactivate"><i class="fal fa-ban"></i> Deactivate </a>';

        var status = row.status

        if(status == "PENDING_APPROVAL" && user_id == row.maker_id){
            return init_btn+dtls_btn+edt_btn+deact_btn+del_btn+'</div>'
        }else if(status == "PENDING_APPROVAL" && user_id != row.maker_id){
            return init_btn+dtls_btn+aprv_btn+'</div>'
        }else if(status == "ACTIVE"){
            return init_btn+dtls_btn+edt_btn+rst_pas_btn+deact_btn+del_btn+'</div>';
        }else if(status == "DEACTIVATED"){
            return init_btn+edt_btn+dtls_btn+act_btn+del_btn+'</div>';
        }else{
            return '<span class="text-danger">No Actions</span>'; 
        }
    }

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
                "first_name": $("#first_name").val(),
                "last_name": $("#last_name").val(),
                "email": $("#email").val(),
                "username": $("#username").val(),
                "from": $("#from").val(),
                "to": $("#to").val()
            }
        },
        "columns": [
            {"data": "first_name"},
            {"data": "last_name"},
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
            data.first_name = $('#filter_first_name').val();
            data.last_name = $('#filter_last_name').val();
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


    





    //================================ ACCOUNTS ==================================
    //---------------------------Walkin Account--------------------------
    $('.delete-walkin-account').on( 'click', function () {
        var del = $(this);

        Swal.fire({
            title: 'Delet Walkin Account?',
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
                    url: '/walkin/account/delete',
                    type: 'post',
                    data: {
                        id: del.attr("data-id"),
                        _csrf_token: del.attr("data-csrf")
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Account Deleted Succesfully!',
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

    //---------------------------Profile accounts ------------------------
    $('#dt_prof_accounts tbody').on('click', '.approve', function () {
        Swal.fire({
            title: 'Approve Client Account?',
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
                    url: '/approve/profile/account',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Account Approved Succesfully!',
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

    //---------------------------Delete Profile account ------------------------
    $('#dt_prof_accounts tbody').on('click', '.delete', function () {
        Swal.fire({
            title: 'Delete Client Account?',
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
                    url: '/delete/profile/account',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'Account Deleted Successfully!',
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



    //------------TEST SERVICE---------
    $('#test_cbs').on( 'click', function () {
        $.blockUI();
        $.ajax({
            url: "/cbs/admin/test",
            type: 'POST',
            data: {
                acc: $('#test_cbs_acc').val(),
                brn: $('#test_cbs_brn').val(),  
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    if (result.data){
                        acc_details(result.data)  
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
    });

    function acc_details(acc){
        var modal = $('#account_details_modal')
        modal.find('.modal-body #acc_name').val(acc.acc_name);
        modal.find('.modal-body #account').val(acc.account);
        modal.find('.modal-body #currency').val(acc.currency);
        modal.find('.modal-body #balance').val(acc.balance);
        $('#account_details_modal').modal('show');
    }









    //============================ USER ROLES =============================
    //----------------------------- Activate --------------------------
    $('#tbl_user_roles tbody').on('click', '.activate', function () {
        Swal.fire({
            title: 'Activate User Role?',
            text: "The Role can be Deactivated again",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/role/activate',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Role Activated Successfully!',
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

    //----------------------------- Deactivate -----------------------------
    $('#tbl_user_roles tbody').on('click', '.deactivate', function () {
        Swal.fire({
            title: 'Deactivate User Role?',
            text: "The Role can be activated again",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/role/deactivate',
                    type: 'post',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        id: $(this).attr("data-id"),
                    },
                    success: function(result) {
                        if (result.data){
                            Swal.fire(
                                'Success',
                                'User Role Deleted Successfully!',
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










    //=======================================================================
    //--------------------- Display Mapped Users ----------- 
    function display_mapped_users_modal(result){
        var modal = $('#mapped-users')

        $('#load-mapped-users').DataTable( {
            language: {"emptyTable": "No users mapped to this profile."},
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: result,
            columns: [
            {"data": "first_name"},
            {"data": "last_name"},
            {"data": "auth_level"}
            ]
        });
        $('#mapped-users').modal('show');
    }

    $('#mapped-users').on('hidden.bs.modal', function (event){
        $('#load-mapped-users').DataTable().clear().destroy();
   });

    //------------ FETCH USERS---------
    $('.btn-mapped-users').on( 'click', function (event) {
        $.ajax({
            url: "/mapped/profile/users",
            type: 'POST',
            timeout: 240000,//4 minute
            data: {
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    display_mapped_users_modal(result.data)
                } else {
                    Swal.fire(
                        'An error occurred',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'An error occurred while fetching users.',
                    '',
                    'error'
                )
            }
        });

    });



        //---------------------Display Mapped Accounts ----------- 
    function display_mapped_accounts_modal(result){
        var modal = $('#mapped_accounts')

        $('#load-mapped-accs').DataTable( {
            language: {"emptyTable": "No accounts mapped to this profile."},
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: result,
            columns: [
            {"data": "currency"},
            {"data": "account"},
            {"data": "balance"}
            ]
        });
        $('#mapped_accounts').modal('show');
    }

    $('#mapped_accounts').on('hidden.bs.modal', function (event){
        $('#load-mapped-accs').DataTable().clear().destroy();
    });

    //------------ FETCH ACCOUNTS---------
    $('.btn-mapped-accounts').on( 'click', function (event) {
        $.ajax({
            url: "/company/Accounts",
            type: 'POST',
            data: {
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    display_mapped_accounts_modal(result.data)
                } else {
                    Swal.fire(
                        'An error occurred while fetching accounts',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'An error occurred while fetching accounts.',
                    '',
                    'error'
                )
            }
        });
    });



    $('#dt_profile_users').DataTable({"responsive": true, "paging": true});
    $('#tbl_user_roles').DataTable({"responsive": true});
    $('#dt_prof_accounts').DataTable({"responsive": true, "paging": true});


        //------------ Close Issue---------
    $('.close-task').on( 'click', function (event) {
        var btn = $(this);
        Swal.fire({
            title: 'Are you sure you want to close the issue?',
            text: "Issue will be marked closed",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/Update/Issue',
                    type: 'post',
                    data: {
                        _csrf_token: btn.attr("data-csrf"),
                        issue_status: "RESOLVED",
                        id: btn.attr("data-id"),
                        date_resolved: new Date().toString()
                    },
                    success: function(result) {
                        Swal.fire(
                            'success',
                            'Issue successfully marked as Closed!!',
                            'success'
                        )
                        location.reload(true);
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'An error occurred, Please try again...',
                            '',
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


    //------------ Close Issue---------
    $('.assign_probase').on( 'click', function (event) {
        var btn = $(this);
        Swal.fire({
            title: 'Do you want to assign the issue to Probase?',
            text: "Issue will be assigned to Probase",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/Update/Issue',
                    type: 'post',
                    data: {
                        _csrf_token: btn.attr("data-csrf"),
                        assigned_to: "PROBASE",
                        id: btn.attr("data-id")
                    },
                    success: function(result) {
                        Swal.fire(
                            'success',
                            'Issue successfully assigned to Probase!!',
                            'success'
                        )
                        location.reload(true);
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'An error occurred, Please try again...',
                            '',
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



    //------------ Close Issue---------
    $('.delete_announcement').on( 'click', function (event) {
        var btn = $(this);
        Swal.fire({
            title: 'Delete Announcement?',
            text: "Announcement will be Deleted",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: '/Delete/Announcement',
                    type: 'delete',
                    data: {
                        _csrf_token: btn.attr("data-csrf"),
                        id: btn.attr("data-id")
                    },
                    success: function(result) {
                        Swal.fire(
                            'success',
                            'Announcement successfully Deleted!!',
                            'success'
                        )
                        location.reload(true);
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'An error occurred, Please try again...',
                            '',
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



























// ----------------------------------------- Sweet Alert
// $(document).ajaxStop($.unblockUI);
// $(document).ajaxStart($.blockUI);
// function getFormData(form){
//     var unindexed_array = form.serializeArray();
//     var indexed_array = {};

//     $.map(unindexed_array, function(n, i){
//         indexed_array[n['name']] = n['value'];
//     });

//     return indexed_array; 
// }


// function formartAmount(amt) {
//     return Number(amt).toLocaleString(undefined, {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });
// }


// function format_value(v) {
//     if(v){
//         return v;
//     } else{
//         return "<span class='text-danger'>Not Set</span>";
//     }
// }

// function formartAdminStatus(status) {
//     var stat = null;
//     if(status == "ACTIVE"){
//         stat = "<span class='text-success'>ACTIVE</span>";
//     }else if(status == "APPROVED"){
//             return '<span class="label text-success">APPROVED</span>';
//     }else if(status == "PENDING_APPROVAL"){
//         stat = "<span class='text-primary'>PENDING APPROVAL</span>";
//     }else if((status == "DEACTIVATED") || (status == "DELETED")){
//         stat = "<span class='text-danger'>"+status+"</span>";
//     }else{
//         stat =status
//     }
//     return stat;
// }

// $.fn.dataTable.render.ellipsis = function ( cutoff, wordbreak, escapeHtml ) {
//     var esc = function ( t ) {
//         return t
//             .replace( /&/g, '&amp;' )
//             .replace( /</g, '&lt;' )
//             .replace( />/g, '&gt;' )
//             .replace( /"/g, '&quot;' );
//     };
 
//     return function ( d, type, row ) {
//         // Order, search and type get the original data
//         if ( type !== 'display' ) {
//             return d;
//         }
 
//         if ( typeof d !== 'number' && typeof d !== 'string' ) {
//             return d;
//         }
 
//         d = d.toString(); // cast numbers
 
//         if ( d.length < cutoff ) {
//             return d;
//         }
 
//         var shortened = d.substr(0, cutoff-1);
 
//         // Find the last white space character in the string
//         if ( wordbreak ) {
//             shortened = shortened.replace(/\s([^\s]*)$/, '');
//         }
 
//         // Protect against uncontrolled HTML input
//         if ( escapeHtml ) {
//             shortened = esc( shortened );
//         }
 
//         return '<span class="ellipsis" title="'+esc(d)+'">'+shortened+'&#8230;</span>';
//     };
// };

// //---------------- Admin approval trail modal ----------------
// function approval_trial_modal(workflow){
//     $('#trail').DataTable( {
//         paging: false,
//         info: false,
//         dom: "lfrti",
//         bFilter: false,
//         data: workflow,
//         columns: [
//             {"data": "auth_level"},
//             {
//                 "data": "initiator",
//                 "render": function ( initiator, type, row ) {
//                     return initiator.first_name+' '+initiator.last_name;
//                 }
//             },
//             {
//                 "data": "approver",
//                 "render": function ( approver, type, row ) {
//                     return (approver? approver.first_name+' '+approver.last_name : '')
//                 }
//             },
//             {
//                 "data": "status",
//                 "class": "center",
//                 "render": function (data, type, row) {
//                     return formartAdminStatus(data)   
//                 }
//             }
//         ]
//     });
//     $('#approval_trial_modal').modal('show');
// }

// function kyc_modal(kyc){
//     var modal = $('#modal_teller_kyc')
//     modal.find('.modal-body #company').val(kyc.company_name);
//     modal.find('.modal-body #address').val(kyc.payer_address);
//     modal.find('.modal-body #email').val(kyc.payer_email);
//     modal.find('.modal-body #mobile').val(kyc.payer_mobile);
//     modal.find('.modal-body #name').val(kyc.payer_name);
//     modal.find('.modal-body #nrc').val(kyc.payer_nrc);
//     $('#modal_teller_kyc').modal('show');
// }



// $('#approval_trial_modal').on('hidden.bs.modal', function (event){
//     $('#trail').DataTable().clear().destroy();
// });



// $(document).ready(function() {
//     $(document).ajaxStop($.unblockUI);


//     jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
//         return this.iterator( 'table', function ( ctx ) {
//             ctx.oApi._fnProcessingDisplay( ctx, show );
//         } );
//     } );

//     //-------------------- Select company under group--------------
//     var link = ""
//     $('.service_pay').on( 'click', function (e) {
//         e.preventDefault();
//         link = $(this).attr("data-url")
//         var is_group = $('#is_group').val();

//         if(is_group === 'TRUE'){

//             if($('#has_subs').val() === 'TRUE'){
//                 $("#select_subsidiary").modal('show');
//             }
//             else{
//                 Swal.fire(
//                     'Oops..',
//                     'No subsidiaries mapped to your profile',
//                     'error'
//                 )
//             }

//         }
//         else{
//             window.location.replace(link+'0')
//         }
//     });


//     $('#selected_sub').on('click', function (){
//         window.location.replace(link+$('#select_sub').val())
//     });


//     //attach profile id on each configuration item

//     // $('#fee_category').on('change', function() {
//     //     var code = $('#fee_category').val();
//     //     var fees = $('#trans_fees').val();
//     //     fees = JSON.parse(fees);
//     //     console.log(fees[code])

//     //     breakdown_div.style.display === "none"
//     //     breakdown_div.style.display = "block"
//     //     //$('#me').val(JSON.parse(acc).acc_num)
//     // });

//     // Client fee mapping category selection
//     $('#fee_category').on('change', function () {
//         var selected = $(this).val();
//         if (selected != '0') {
//             $('#fee_dev').show();
//             $( "#map_btn" ).hide();
//             $('#fee_dev div').hide();  //hide all radio buttons initially
//             $('#fee_dev div.' + selected).show();  //show radio buttons with the right class
//             if ($('#fee_dev div.' + selected).length){
//                 $( "#select_parag" ).show()
//             }else{
//                 $( "#map_btn" ).hide();
//                 $( "#select_parag" ).hide();
//             }
//         } else {
//             $('#fee_dev').hide();
//             $('#fee_dev div').hide();
//         }

//     });
//     $( "#fee_dev" ).hide();
//     $( "#select_parag" ).hide();
//     $( "#map_btn" ).hide();

//     $('#fee_form input[type=radio]').on('click', function(){
//         $( "#map_btn" ).show();
//     });


//     //view user modal
//     $('#viewUser').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #user-input').val(button.attr("data-id"));
//         modal.find('.modal-body #profile_id').val(button.attr("data-id"));
//         modal.find('.modal-body #payment-input').val(button.attr("data-id"));
//         modal.find('.modal-body #company_id').val(button.attr("data-id"));
//     });

//     //Edit branch modal
//     $('#editBranch').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #id').val(button.attr("data-id"));
//         modal.find('.modal-body #code').val(button.attr("data-code"));
//         modal.find('.modal-body #name').val(button.attr("data-name"));
//         modal.find('.modal-body #pull_acc').val(button.attr("data-pull_acc"));
//         modal.find('.modal-body #pull_acc_name').val(button.attr("data-pull_acc_name"));
//     });

//     //Edit Currency modal
//     $('#editCurrency').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #id').val(button.attr("data-id"));
//         modal.find('.modal-body #code').val(button.attr("data-code"));
//         modal.find('.modal-body #acronym').val(button.attr("data-acronym"));
//         modal.find('.modal-body #descript').val(button.attr("data-descript"));
//         modal.find('.modal-body #type').val(button.attr("data-type"));
//     });


//     //pass company id value to authlevel modal
//     $('#authModal').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #company_id').val(button.find('#company_id').val());
//     });

//     //redirect to users with attached profile id
//     $('#map_user').on('click', function (){
//         window.location.replace('/Users/Clients?id='+$('#user-input').val())
//     });

//     //redirect to payments with attached profile id
//     $('#payment').on('click', function (){
//         window.location.replace('/Payments?id='+$('#payment-input').val())
//     });

//     //redirect to mappings with attached profile id
//     $('#mappings').on('click', function (){
//         window.location.replace('/Mappings?profile_id='+$('#profile_id').val())
//     });

//     $('#user_role_select').on('change', function (){
//         var style = this.value == "APPROVER" ? 'block' : 'none';
//         document.getElementById('hidden_div').style.display = style;
//     });

//     //batch assessment approval modal data passing
//     $('#approve_batch').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #batch_ref').val(button.attr("data-batch_ref"));
//     });

//     $('#decline_batch').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #ref').val(button.attr("data-batch_ref"));
//     });



//     //bill PRN approval modal data passing
//     $('#approve_prn_modal').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #approval_prn').val(button.attr("data-prn"));
//     });

//     $('#decline_prn_modal').on('show.bs.modal', function (event){
//         var button = $(event.relatedTarget)
//         var modal = $(this)
//         modal.find('.modal-body #decline_prn').val(button.attr("data-prn"));

//     });









//     // -------------------------------------- Switch input-views
//     $('#mapping_service').on('change', function() {
//       //  alert( this.value ); // or $(this).val()
//       if(this.value == "ZRA") {
//         $('#agent_type').show();
//         $('#cat1').show();
//       }
//       // else
//       //   $('#agent_type').hide();
//       //   $('#cat1').hide();
//       // }
//     });


//     $('.remove_subsidiary_user').on( 'click', function () {
//         var del = $(this);

//         Swal.fire({
//             title: 'Remove user from subsidiary?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/remove/subsidiary/user',
//                     type: 'post',
//                     data: {
//                         user_id: del.attr("data-user_id"),
//                         sub_id: del.attr("data-sub_id"),
//                         _csrf_token: del.attr("data-csrf")
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'User removed successfuly!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });









//     //------------resend token---------
//     $('.resend_token').on( 'click', function (event) {
//         Swal.fire({
//             title: 'Proceed to resend token?',
//             text: "Resend approval token for this transaction",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: "/Smartpay/notifications/resend_token",
//                     type: 'POST',
//                     data: {
//                         ref_id: $('#ref_id').val(),
//                         _csrf_token: $('#csrf').val()
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             if (result.data){
//                                 Swal.fire(
//                                     'Success',
//                                     result.data,
//                                     'success'
//                                 )
//                             }else{
//                                 Swal.fire(
//                                     'Oops..',
//                                     result.error,
//                                     'error'
//                                 )
//                             }
//                             //location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });


   

//   //-----------Unmap User From Fee--------
//   $('.delete_fee_mapping').on( 'click', function () {
//     var del = $(this);

//     Swal.fire({
//         title: 'Unmap User From Fee?',
//         text: "You won't be able to revert this!",
//         type: "warning",
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, continue!',
//         showLoaderOnConfirm: true
//         }).then((result) => {
//         if (result.value) {
//             $.ajax({
//                 url: '/Remove/Clients/under/fee',
//                 type: 'post',
//                 data: {
//                     id: del.attr("data-id"),
//                     _csrf_token: del.attr("data-csrf")
//                 },
//                 success: function(result) {
//                     if (result.data){
//                         Swal.fire(
//                             'Success',
//                             'User Unmaped From Fee Succesfully!',
//                             'success'
//                         )
//                         location.reload(true);
//                     } else {
//                         Swal.fire(
//                             'Oops',
//                             result.error,
//                             'error'
//                         )
//                         location.reload(true);
//                     }
//                 },
//                 error: function(request, msg, error) {
//                     Swal.fire(
//                         'Oops..',
//                         'Something went wrong! try again',
//                         'error'
//                     )
//                 }
//             });
//         } else {
//             Swal.fire(
//                 'Cancelled',
//                 'Operation not performed :)',
//                 'error'
//             )
//         }
//     })
// });




//   //-----------Delete Department--------
//   $('.delete_department').on( 'click', function () {
//     var del = $(this);

//     Swal.fire({
//         title: 'Delet Department?',
//         text: "You won't be able to revert this!",
//         type: "warning",
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Yes, continue!',
//         showLoaderOnConfirm: true
//         }).then((result) => {
//         if (result.value) {
//             $.ajax({
//                 url: '/Delete/Department/Details',
//                 type: 'post',
//                 data: {
//                     id: del.attr("data-id"),
//                     _csrf_token: del.attr("data-csrf")
//                 },
//                 success: function(result) {
//                     if (result.data){
//                         Swal.fire(
//                             'Success',
//                             'Department Deleted Succesfully!',
//                             'success'
//                         )
//                         location.reload(true);
//                     } else {
//                         Swal.fire(
//                             'Oops',
//                             result.error,
//                             'error'
//                         )
//                         location.reload(true);
//                     }
//                 },
//                 error: function(request, msg, error) {
//                     Swal.fire(
//                         'Oops..',
//                         'Something went wrong! try again',
//                         'error'
//                     )
//                 }
//             });
//         } else {
//             Swal.fire(
//                 'Cancelled',
//                 'Operation not performed :)',
//                 'error'
//             )
//         }
//     })
// });



// //--------------------------------Client Mnagement Table-------------------
// var user_id = $("#user_id").val();
// var tbl_client_profiles = $('#client_profiles').DataTable({
//     "select": {
//         "style": 'multi'
//     },
//     "responsive": true,
//     "processing": true,
//     'language': {
//         'loadingRecords': '&nbsp;',
//         processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
//         "emptyTable": "No Client's to display"
//     },
//     "paging": true,
//     "pageLength": 10,
//     "serverSide": true,
//     "ajax": {
//         "type"   : "POST",
//         "url"    : '/client/Profiles',
//         "data"   : {
//             "_csrf_token": $("#csrf").val(),
//             "name": $("#name").val(),
//             "client_type": $("#client_type").val(),
//             "email": $("#email").val(),
//             "approval_status": $("#approval_status").val(),
//             "phone": $("#phone").val(),
//             "from": $("#from").val(),
//             "to": $("#to").val()
//         }
//     },
//     "columns": [
//         {"data": "name"},
//         {"data": "phone"},
//         {"data": "email"},
//         {"data": "client_type"},
//         {
//             "data": "status",
//             "class": "center",
//             "render": function (data, type, row) {
//                 return formartAdminStatus(data)   
//             }
//         },
//         {
//             "data": "id",
//             "render": function (data, type, row) {
//                 if(row.status == "ACTIVE"){
//                     return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                     '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                          '<a href="/Profile/Configuarations?id='+data+'" class="dropdown-item text-info"><i class="fal fa-align-left"></i> Details </a>'+
//                          '<a href="#" data-id="'+data+'" class="dropdown-item text-danger deactivate_profile">'+
//                          '<i class="fal fa-times"></i> Deactivate Profile </a>'+
//                          '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_profile"><i class="fal fa-trash"></i> Delete </a>'+
//                     '</div>';
//                 }else if(row.status == "PENDING_APPROVAL" && user_id != row.creator_id ){
//                     return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                     '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                         '<a href="#" data-id="'+data+'" class="dropdown-item text-info approve">Approve</a>'+
//                     '</div>';
//                 }else if(row.status == "DEACTIVATED"){
//                     return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                     '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                         '<a href="#" data-id="'+data+'" class="dropdown-item text-info activate_profile"><i class="fal fa-check"></i> Activate </a>'+
//                     '</div>';
//                 }
                
//             },
//             "defaultContent": "<span class='text-danger'>Not Set</span>"
//         } 
//     ],
//     'columnDefs': [
//         {
//             "targets": 5,
//             "className": "text-center"
//         }
//     ],
//     "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
//     "order": [[1, 'asc']],
//         responsive: true,
//         lengthChange: false,
//         dom:
//             "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
//             "<'row'<'col-sm-12'tr>>" +
//             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
//     });



//     $('#btn_client_profile_admin_filter').on( 'click', function () {
//         tbl_client_profiles.on('preXhr.dt', function ( e, settings, data ) {
//             console.log(data)
//             data._csrf_token = $("#csrf").val();
//             data.name = $('#name').val();
//             data.email = $('#email').val();
//             data.client_type = $('#client_types').val();
//             data.approval_status = $('#approval_status').val();
//             data.phone = $('#phone').val();
//             data.from = $('#from').val();
//             data.to = $('#to').val();  
//         } );
//         $('#filter').modal('hide');
//         tbl_client_profiles.draw();
//     });

//     $('#reload_table').on( 'click', function () {
//         tbl_client_profiles.ajax.reload();
//     });

//     $('#client_admin_excel').on( 'click', function (event) {
//         $('#clientSearchForm').attr('action', '/client/admin/export/excel');
//         $('#clientSearchForm').attr('method', 'GET');
//         $("#clientSearchForm").submit();
//     });

//     //--------------------------Approve Client Profile/ Update--------
//     $('#client_profiles tbody').on('click', '.approve', function () {
//         var btn = $(this);
//         Swal.fire({
//             title: 'Approve Client Profile?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/approve/Profile',
//                     type: 'post',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         id: btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Client Profile Approved Succesfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//     //-------------------------- Deactivate Client Profile------------------/
//     $('#client_profiles tbody').on('click', '.deactivate_profile', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Deactivate Client Profile?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/deactivate/profile',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                     "id": btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Client Profile Succesfully Deactivated',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//     //--------------------------Activate Client Profile------------------/
//     $('#client_profiles tbody').on('click', '.activate_profile', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Activate Client Profile?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/activate/profile',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                     "id": btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Client Profile Succesfully Activated',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//    //--------------------------Delete Client Profile------------------/
//    $('#client_profiles tbody').on('click', '.delete_profile', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Delete Client Profile?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/delete/profile',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                     "id": btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Client Profile Succesfully Deleted',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//     //-----------Approve Subsidiary Profile/ Update--------
//     $('#dt_subsidaries tbody').on('click', '.approve', function () {
//         var btn = $(this);
//         Swal.fire({
//             title: 'Approve Subsidiary Profile?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/approve/Profile',
//                     type: 'post',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         id: btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Client Profile Approved Succesfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });



//     //--------------------------------User Management Table-------------------
//     var user_id = $("#user_id").val();
//     var tbl_user_management = $('#user_details_table').DataTable({
//         "select": {
//             "style": 'multi'
//         },
//         "responsive": true,
//         "processing": true,
//         'language': {
//             'loadingRecords': '&nbsp;',
//             processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
//             "emptyTable": "No User Details to display"
//         },
//         "paging": true,
//         "serverSide": true,
//         "ajax": {
//             "type"   : "POST",
//             "url"    : '/User/Management/Table',
//             "data"   : {
//                 "_csrf_token": $("#csrf").val(),
//             }
//         },
//         "columns": [
//             {"data": "first_name"},
//             {"data": "last_name"},
//             {"data": "email"},
//             {"data": "user_role"},
//             {
//                 "data": "status",
//                 "render": function (data, type, row) {
//                     return formartAdminStatus(data)   
//                 }
//             },
//             {
//                 "data": "id",
//                 "render": function (data, type, row) {
//                     if(row.status == "ACTIVE"){
//                         return '<button class="btn btn-secondary btn-xs text-white" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                         '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                             '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_user_details"><i class="fal fa-eye"></i> View </a>'+
//                             '<a href="#" class="dropdown-item text-info update_user_details"'+
//                                 'data-id="'+data+'" data-username="'+row.username+'" data-first_name="'+row.first_name+'" data-last_name="'+row.last_name+'"'+
//                                 'data-phone="'+row.phone+'"'+
//                                 'data-email="'+row.email+'" data-id_no="'+row.id_no+'" data-user_role="'+row.user_role+'">'+
//                             '<i class="fal fa-edit"></i> Edit </a>'+
//                             '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_user_account"><i class="fal fa-trash"></i> Delete </a>'+
//                             '<a href="#" data-id="'+data+'" data-email="'+row.email+'" class="dropdown-item text-danger reset_user_password" ><i class="fal fa-watch"></i> Reset Password </a>'+
//                             '<a href="#" data-id="'+data+'" data-username="'+row.username+'" class="dropdown-item text-danger deactivate_user_account"><i class="fal fa-times"></i> Deactivate </a>'+
//                         '</div>';
//                     }
//                     else{

//                         if(row.status == "PENDING_APPROVAL" && user_id != row.maker_id){
//                         return '<button class="btn btn-secondary btn-xs text-white" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                         '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                             '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_user_details"><i class="fal fa-eye"></i> View </a>'+
//                             '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_user_account" ><i class="fal fa-trash"></i> Delete </a>'+
//                             '<a href="#" data-id="'+data+'" class="dropdown-item text-info activate_user_account" ><i class="fal fa-check"></i> Approve </a>'+
//                             '</div>';
//                         }
//                         else{

//                             if(row.status == "PENDING_APPROVAL" && user_id == row.maker_id){
//                                 return '<button class="btn btn-secondary btn-xs text-white" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                                 '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                                     '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_user_details"><i class="fal fa-eye"></i> View </a>'+
//                                     '<a href="#" class="dropdown-item text-info update_user_details"'+
//                                         'data-id="'+data+'" data-first_name="'+row.first_name+'" data-last_name="'+row.last_name+'"'+
//                                         'data-phone="'+row.phone+'"'+
//                                         'data-email="'+row.email+'" data-id_no="'+row.id_no+'" data-user_role="'+row.user_role+'">'+
//                                     '<i class="fal fa-edit"></i> Edit </a>'+
//                                     '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_user_account" ><i class="fal fa-trash"></i> Delete </a>'+
//                                     '</div>';
//                                 }
//                             else{
        
//                                 if(row.status == "RETIRED"){
//                                     return '<button class="btn btn-secondary btn-xs text-white" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                                     '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                                         '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_user_details"><i class="fal fa-eye"></i> View </a>'+
//                                         '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_user_account" ><i class="fal fa-trash"></i> Delete </a>'+
//                                         '</div>';
//                                     }
//                                 else{
            
//                                     return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
//                                     '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                                         '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_user_details"><i class="fal fa-eye"></i>View</a>'+
//                                         '<a href="#" data-id="'+data+'" class="dropdown-item text-danger delete_user_account" ><i class="fal fa-trash"></i> Delete </a>'+
//                                         '<a href="#" data-id="'+data+'" class="dropdown-item text-info activate_user_account" ><i class="fal fa-check"></i> Activate </a>'+
//                                     '</div>';
            
//                                 }
//                             }
//                         }

//                     }

//                 },
//             }
//         ],
//         "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
//         "order": [[1, 'asc']]
//     });


//     function view_user(result){
//         console.log(result)
//         var data = result.data
//         var modal = $('#user_details')

//         modal.find('.modal-body #username').text(data.username);
//         modal.find('.modal-body #first_name').text(data.first_name);
//         modal.find('.modal-body #last_name').text(data.last_name);
//         modal.find('.modal-body #phone').text(data.phone);
//         modal.find('.modal-body #email').text(data.email);
//         modal.find('.modal-body #id_no').text(data.id_no);
//         modal.find('.modal-body #id_type').text(data.id_type);
//         modal.find('.modal-body #user_role').text(data.user_role);
//         $('#user_details').modal('show');
//     }


//     $('#user_details_table tbody').on('click', '.view_user_details', function () {
// 		$.ajax({
//             url: "/User/details",
//             type: 'POST',
//             data: {
//                 id: $(this).attr("data-id"),
//                 _csrf_token: $('#csrf').val()
//             },
//             success: function(result) {
//                 if (result.data){
//                     view_user(result)
//                 } else {
//                     Swal.fire(
//                         'Oops',
//                         result.error,
//                         'error'
//                     )
//                 }
//             },
//             error: function(request, msg, error) {
//                 Swal.fire(
//                     'Oops..',
//                     'Something went wrong! try again',
//                     'error'
//                 )
//             }
//         })
//     });

//     //--------------------------Reset User Password------------------/
//     $('#user_details_table tbody').on('click', '.reset_user_password', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Reset User Password?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/Reset/User/Password',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                        "id": btn.attr("data-id"),
//                         "email": btn.attr("data-email"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'User Password Succesfully Reset!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });





//     //-------------------------------------Edit User--------------------------------
//     $('#user_details_table tbody').on('click', '.update_user_details', function (e) {
//         e.preventDefault();
//         let btn = $(this);
//         var modal = $('#edit_system_user_modal');
//         modal.find('.modal-body #id').val(btn.attr("data-id"));
//         modal.find('.modal-body #first_name').val(btn.attr("data-first_name"));
//         modal.find('.modal-body #last_name').val(btn.attr("data-last_name"));
//         modal.find('.modal-body #id_no').val(btn.attr("data-id_no"));
//         modal.find('.modal-body #user_role').val(btn.attr("data-user_role"));
//         modal.find('.modal-body #phone').val(btn.attr("data-phone"));
//         modal.find('.modal-body #email').val(btn.attr("data-email"));
//         modal.modal('show');
//     });





//     //--------------------------Deactivate User-------------------------
//     $('#user_details_table tbody').on('click', '.deactivate_user_account', function (e) {
//         e.preventDefault();
//         let btn = $(this);
//         console.log("0000000000000000000000");
//         console.log(btn.attr("data-id"));
//         let form = document.getElementById('deactivate_user_account_form');
//         form.innerHTML = `
//             <div class="form-group">
//                 <label class="form-label">Deactivate Account for ${btn.attr("data-username")}</label>
//                 <div class="input-group">
//                     <div class="input-group-prepend">
//                         <span class="input-group-text"><i class="fal fa-user-circle width-1 text-align-center"></i></span>
//                     </div>
//                     <select class="custom-select form-control" name="status" required="required">
//                         <option>Select Reason of Deactivation</option>
//                         <option value="ONLEAVE">On Leave</option>
//                         <option value="SUSPENDED">Suspend</option>
//                         <option value="DISMISSED">Dismissed</option>
//                         <option value="RETIRED">Retired</option>
//                     </select><br>
//                 </div>
//             </div>
            

//             <div class="form-group">
//                 <div class="input-group-prepend">
//                     <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
//                 </div>
//             </div>
            

//             <div class="form-group">
//                 <label class="form-label">Reason For Deactivation</label>
//                 <div class="input-group">
//                     <div class="input-group-prepend">
//                         <span class="input-group-text"><i class="fal fa-edit"></i></span>
//                     </div>
//                     <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
//                     <input type="text" name="disabled_reason" placeholder="Explain why account is being deactivated" class="form-control" required="required">
//                 </div>
//             </>


//             <div class="modal-footer">
//                 <button type="button" class="btn btn-sm btn-secondary btn-pills waves-effect waves-themed text-white" data-dismiss="modal">Close</button>
//                 <button type="submit" class="btn btn-sm btn-pills waves-effect waves-themed text-white" style="background-color: #8dc63f;">Deactivate Account</button>
//             </div>
//         `;
//         $('#deactivate_user').modal('show');
//     });


//     $('#deactivate_user_account_form').submit(function(e) {
//         e.preventDefault();
//         let data = $(this).serialize();
//         $('#deactivate_user').modal('hide');
//         Swal.fire({
//             title: 'Are you sure?',
//             text: 'You will Deactivate User Account',
//             type: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, Deactivate User Account!'
//         }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     type: 'POST',
//                     url: '/Update/User',
//                     data: data,
//                     success: function (result) {
//                         if (result.data) {
//                             Swal.fire(
//                                 'Success',
//                                 'User Account Succesfully Deactivated!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Failed!',
//                                 response.message,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled!',
//                     'Operation cancelled :)',
//                     'error'
//                 )
//             }
//         });
//     });


//     //--------------------------Activate User Account------------------/
//     $('#user_details_table tbody').on('click', '.activate_user_account', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Activate User Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/Update/User',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                        "id": btn.attr("data-id"),
//                        "status": "ACTIVE",
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Account Succesfully Activated',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });


//     //--------------------------Delete User Account------------------/
//     $('#user_details_table tbody').on('click', '.delete_user_account', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Delete User Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/Update/User',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         "id": btn.attr("data-id"),
//                         "status": "DELETED",
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Account Succesfully Deleted',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });




//     //-----------Walkin Account--------
//     $('.delete-walkin-account').on( 'click', function () {
//         var del = $(this);

//         Swal.fire({
//             title: 'Delet Walkin Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/walkin/account/delete',
//                     type: 'post',
//                     data: {
//                         id: del.attr("data-id"),
//                         _csrf_token: del.attr("data-csrf")
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Account Deleted Succesfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });


//     //-----------DElete profile user--------
//     $('#dt_profile_users tbody').on('click', '.delete_user', function () {
//         var del = $(this);

//         Swal.fire({
//             title: 'Delete User Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/delete/user/account',
//                     type: 'post',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         id: del.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'User Deleted Succesfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//     // ---------------- reset client user password --------------
//     $('#dt_profile_users tbody').on('click', '.reset_password', function () {
//         var btn = $(this);

//         Swal.fire({
//             title: 'Reset User Password?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/Reset/User/Password',
//                     type: 'POST',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                        "id": btn.attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'User Password Succesfully Reset!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });


//     //=============== Profile accounts ================
//     $('#dt_prof_accounts tbody').on('click', '.approve', function () {
//         Swal.fire({
//             title: 'Approve Client Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/approve/profile/account',
//                     type: 'post',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         id: $(this).attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Account Approved Succesfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });

//     $('#dt_prof_accounts tbody').on('click', '.delete', function () {
//         Swal.fire({
//             title: 'Delete Client Account?',
//             text: "You won't be able to revert this!",
//             type: "warning",
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Yes, continue!',
//             showLoaderOnConfirm: true
//             }).then((result) => {
//             if (result.value) {
//                 $.ajax({
//                     url: '/delete/profile/account',
//                     type: 'post',
//                     data: {
//                         _csrf_token: $('#csrf').val(),
//                         id: $(this).attr("data-id"),
//                     },
//                     success: function(result) {
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 'Account Deleted Successfully!',
//                                 'success'
//                             )
//                             location.reload(true);
//                         } else {
//                             Swal.fire(
//                                 'Oops',
//                                 result.error,
//                                 'error'
//                             )
//                             location.reload(true);
//                         }
//                     },
//                     error: function(request, msg, error) {
//                         Swal.fire(
//                             'Oops..',
//                             'Something went wrong! try again',
//                             'error'
//                         )
//                     }
//                 });
//             } else {
//                 Swal.fire(
//                     'Cancelled',
//                     'Operation not performed :)',
//                     'error'
//                 )
//             }
//         })
//     });



//     //------------TEST SERVICE---------
//     $('#test_cbs').on( 'click', function () {
//         $.blockUI();
//         $.ajax({
//             url: "/cbs/admin/test",
//             type: 'POST',
//             data: {
//                 acc: $('#test_cbs_acc').val(),
//                 brn: $('#test_cbs_brn').val(),  
//                 _csrf_token: $('#csrf').val()
//             },
//             success: function(result) {
//                 if (result.data){
//                     if (result.data){
//                         acc_details(result.data)  
//                     }else{
//                         Swal.fire(
//                             'Oops..',
//                             result.error,
//                             'error'
//                         )
//                     }
//                 } else {
//                     Swal.fire(
//                         'Oops',
//                         result.error,
//                         'error'
//                     )
//                 }
//             },
//             error: function(request, msg, error) {
//                 Swal.fire(
//                     'Oops..',
//                     'Something went wrong! try again',
//                     'error'
//                 )
//             }
//         });
//     });

//     function acc_details(acc){
//         var modal = $('#account_details_modal')
//         modal.find('.modal-body #name').val(acc.name);
//         modal.find('.modal-body #balance').val(acc.balance);
//         $('#account_details_modal').modal('show');
//     }




//      // ========================== BLOCK USER ACCOUNT TABLE ======================= //
//  var user_id = $("#user_id").val();
//  var tbl_blocked_users = $('#blocked_users_table').DataTable({
//      "select": {
//          "style": 'multi'
//      },
//      "responsive": true,
//      "processing": true,
//      'language': {
//          'loadingRecords': '&nbsp;',
//          processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
//          "emptyTable": "No Client's to display"
//      },
//      "paging": true,
//      "pageLength": 10,
//      "serverSide": true,
//      "ajax": {
//          "type"   : "POST",
//          "url"    : '/system/user/accounts',
//          "data"   : {
//              "_csrf_token": $("#csrf").val(),
//          }
//      },
//      "columns": [
//          {"data": "first_name"},
//          {"data": "phone"},
//          {"data": "email"},
//          {"data": "username"},
//          {"data": "updated_at"},
//          {
//              "data": "id",
//              "render": function (data, type, row) {
//                  return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #2196F3; color: #fff; font-weight: bold;">Options</button>'+
//                  '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
//                  '<a href="#" data-id="'+data+'" class="dropdown-item text-info unblock_user"><i class="fal fa-unlock"></i> Unblock </a>'+
//                  '</div>';
//              },
//          }
 
 
 
//      ],
//      "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
//      "order": [[1, 'asc']],
//          responsive: true,
//          lengthChange: false,
//          dom:
//              "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
//              "<'row'<'col-sm-12'tr>>" +
//              "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
// });
 
// $('#blocked_users_table tbody').on('click', '.unblock_user', function () {
//     var btn = $(this);
//     console.log("=========What is Coming In Here")
//     console.log(btn)

//     Swal.fire({
//         title: 'Are you sure you want to unblock this account?',
//         text: "The user will be sent a reset password.",
//         type: "warning",
//         showCancelButton: true,
//         confirmButtonColor: '#3085d6',
//         cancelButtonColor: '#d33',
//         confirmButtonText: 'Unblock!',
//         showLoaderOnConfirm: true
//         }).then((result) => {
//         if (result.value) {
//             $.ajax({
//                 url: '/system/user/account/unblock',
//                 type: 'POST',
//                 data: {
//                     _csrf_token: $('#csrf').val(),
//                     "user_id": btn.attr("data-id")
//                 },
//                 success: function(result) {
//                     if (result.data){
//                         if (result.data){
//                             Swal.fire(
//                                 'Success',
//                                 result.data,
//                                 'success'
//                             )
//                             location.reload(true);   
//                         }else{
//                             Swal.fire(
//                                 'Oops..',
//                                 result.error,
//                                 'error'
//                             )
//                         }
//                     } else {
//                         Swal.fire(
//                             'Oops',
//                             result.error,
//                             'error'
//                         )
//                         location.reload(true);
//                     }
//                 },
//                 error: function(request, msg, error) {
//                     Swal.fire(
//                         'Oops..',
//                         'Something went wrong! try again',
//                         'error'
//                     )
//                 }
//             });
//         } else {
//             Swal.fire(
//                 'Cancelled',
//                 'Operation not performed :)',
//                 'error'
//             )
//         }
//     })
// });







// function acc_details(acc){
//     var modal = $('#account_details_modal')
//     modal.find('.modal-body #name').val(acc.name);
//     modal.find('.modal-body #balance').val(acc.balance);
//     $('#account_details_modal').modal('show');
// }



// //--------------------- Display Mapped Users ----------- 
// function display_mapped_users_modal(result){
//     var modal = $('#mapped-users')

//     $('#load-mapped-users').DataTable( {
//         language: {"emptyTable": "No users mapped to this profile."},
//         paging: false,
//         info: false,
//         dom: "lfrti",
//         bFilter: false,
//         data: result,
//         columns: [
//         {"data": "first_name"},
//         {"data": "last_name"},
//         {"data": "auth_level"}
//         ]
//     });
//     $('#mapped-users').modal('show');
// }

// $('#mapped-users').on('hidden.bs.modal', function (event){
//     $('#load-mapped-users').DataTable().clear().destroy();
// });

// //------------ FETCH USERS---------
// $('.btn-mapped-users').on( 'click', function (event) {
//     $.ajax({
//         url: "/mapped/profile/users",
//         type: 'POST',
//         timeout: 240000,//4 minute
//         data: {
//             _csrf_token: $('#csrf').val()
//         },
//         success: function(result) {
//             if (result.data){
//                 display_mapped_users_modal(result.data)
//             } else {
//                 Swal.fire(
//                     'An error occurred',
//                     result.error,
//                     'error'
//                 )
//             }
//         },
//         error: function(request, msg, error) {
//             Swal.fire(
//                 'An error occurred while fetching users.',
//                 '',
//                 'error'
//             )
//         }
//     });

// });



// //---------------------Display Mapped Accounts ----------- 
// function display_mapped_accounts_modal(result){
//     var modal = $('#mapped_accounts')

//     $('#load-mapped-accs').DataTable( {
//         language: {"emptyTable": "No accounts mapped to this profile."},
//         paging: false,
//         info: false,
//         dom: "lfrti",
//         bFilter: false,
//         data: result,
//         columns: [
//         {"data": "currency"},
//         {"data": "account"},
//         {"data": "balance"}
//         ]
//     });
//     $('#mapped_accounts').modal('show');
// }

// $('#mapped_accounts').on('hidden.bs.modal', function (event){
//      $('#load-mapped-accs').DataTable().clear().destroy();
// });

// //------------ FETCH ACCOUNTS---------
// $('.btn-mapped-accounts').on( 'click', function (event) {
//     $.ajax({
//         url: "/company/Accounts",
//         type: 'POST',
//         data: {
//             _csrf_token: $('#csrf').val()
//         },
//         success: function(result) {
//             if (result.data){
//                 display_mapped_accounts_modal(result.data)
//             } else {
//                 Swal.fire(
//                     'An error occurred while fetching accounts',
//                     result.error,
//                     'error'
//                 )
//             }
//         },
//         error: function(request, msg, error) {
//             Swal.fire(
//                 'An error occurred while fetching accounts.',
//                 '',
//                 'error'
//             )
//         }
//     });

// });

// });
