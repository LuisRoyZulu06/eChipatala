$(document).ajaxStart($.blockUI);
$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);
    //approval modal data passing
    $('#approve_npin_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #ap_npin_id').val(button.attr("data-npin_id"));
    });

    $('#decline_npin_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #de_npin_id').val(button.attr("data-npin_id"));
    });

    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-info'>PENDING BANK PAYMENT</span>";
        }else if(status == "PENDING_NOTIFICATION"){
            stat = "<span class='text-info'>PENDING NOTIFICATION</span>";
        }else if((status == "FAILED_PAYMENT") || (status == "FAILED_NOTIFICATION")){
            stat = "<span class='text-danger'>FAILED</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-danger'>"+status+"</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else{
            stat = "<span class='text-info'>"+status+"</span>";
        }
        return stat;
    }



    $('#npin_details').on('show.bs.modal', function (event){
         var button = $(event.relatedTarget)
         var modal = $(this)
 
         modal.find('.modal-body #npin').text(button.data('npin'));
         modal.find('.modal-body #emp_name').text(button.data('emp_name'));
         modal.find('.modal-body #amount').text(button.data('amount'));
         modal.find('.modal-body #date').text(button.data('date'));
         modal.find('.modal-body #exp_date').text(button.data('exp_date'));
         
     });

    //------------drop npin---------
    $('.nhima_drop_npin').on( 'click', function (event) {
        Swal.fire({
            title: 'Are you sure you want to drop NPIN?',
            text: "proceed To Drop NPIN",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: "/nhima/npin/drop",
                    type: 'POST',
                    data: {
                        id: $(event.target).attr("data-id"), 
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

    function object_to_float(amount){
        var num= amount.coef.toString()
        num =num.substring(0, num.length - 2) + "." + num.substring(num.length - 2);
        return parseFloat(num) 
    }



    //---------------------display submission result -----------
    function nhima_select_acc_modal(result){
        var npin = result.npin
        var accounts = result.accounts
        var amount = parseFloat(npin.amount)
        var charge = parseFloat($('#txn_charge').val())
        var total_amount = amount+charge
        var modal = $('#nhima_payment')


        modal.find('.modal-body #payment_npin').val(npin.npin);
        modal.find('.modal-body #total_amount').val(total_amount);
        modal.find('.modal-body #npin').text(npin.npin);
        modal.find('.modal-body #amount').text(amount);
        modal.find('.modal-body #npin_date').text(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').text(npin.npin_exp_date);
        modal.find('.modal-body #charge').text(charge);
        modal.find('.modal-body #total').text(total_amount);
        $('#accounts').DataTable( {
            language: {"emptyTable": "Accounts empty or cant get balances"},
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: accounts,
            columns: [
            {"data": "account"},
            {"data": "name"},
            {"data": "balance"},
            {
                "data": "account",
                "render": function ( account, type, row ) {
                    return '<input type="radio" name="nhima_dr_acc" value="'+account+'" data-brn="'+row.branch_code+'" data-balance="'+row.balance+'">';                  
                }
            }
            ]
        });
        $('#nhima_payment').modal('show');
    }

    //------------ NHIMA PAYMENT CONFIRMATION---------
    $('.nhima_init_npin').on( 'click', function (event) {
        $.blockUI();
        $.ajax({
            url: "/nhima/confirmation",
            type: 'POST',
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    nhima_select_acc_modal(result)
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


    //------------NHIMA submit---------
    $('#nhima_submit').on( 'click', function (event) {
        var acc_radio = $("input[type='radio'][name='nhima_dr_acc']:checked")
        //var dr_acc = $("input[name='nhima_dr_acc']:checked").val();
        $('#nhima_payment').modal('hide');
        if(!dr_acc){
            Swal.fire(
                'Oops..',
                'You have not selected payment account!',
                'error'
            )
            return false;
        }

        Swal.fire({
            title: 'Proceed payment submission?',
            text: "proceed with NPIN payment",
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
                    url: "/nhima/init/payment",
                    type: 'POST',
                    data: {
                        npin: $('#payment_npin').val(),
                        total_amount: $('#total_amount').val(), 
                        dr_acc: acc_radio.val(),
                        acc_brn: acc_radio.attr("data-brn"), 
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
                                location.reload(true);   
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


    function nhima_pending_approval_details(result){
        var npin = result.npin
        var workflow = result.workflow
        var modal = $('#pending_appr_details_modal')

        modal.find('.modal-body #payment_npin').val(npin.npin);
        modal.find('.modal-body #npin').text(npin.npin);
        modal.find('.modal-body #amount').text(npin.amount);
        modal.find('.modal-body #dr_acc').text(npin.dr_acc);
        modal.find('.modal-body #npin_date').text(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').text(npin.npin_exp_date);
        modal.find('.modal-body #emp_no').text(npin.employer_no);
        $('#workflow').DataTable( {
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
                    render: function (data, type, row) {
                        if(data == 'APPROVED'){
                            return '<span class="label text-success">'+data+'</span>';
                        } else if (data=='PENDING_APPROVAL') {
                            return '<span class="label text-info">'+data+'</span>';
                        } else{
                            return '<span class="label text-danger">'+data+'</span>';
                        }
                    }
                },
            ]
        });
        $('#pending_appr_details_modal').modal('show');
    }


    $('.nhima_view_npin_details').on( 'click', function (event) {
        $.ajax({
            url: "/nhima/pending/approval/details",
            type: 'POST',
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    nhima_pending_approval_details(result)
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


    $('#nhima_approve_npin_btn').on( 'click', function (event) {

        Swal.fire({
            title: 'Are you sure you want to approve NPIN?',
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
                    url: "/nhima/approve",
                    type: 'POST',
                    data: {
                        id: $('#ap_npin_id').val(), 
                        token: $('#approval_token').val(), 
                        note: $('#approver_note').val(), 
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


    $('#nhima_decline_npin_btn').on( 'click', function (event) {

        Swal.fire({
            title: 'Are you sure you want to decline NPIN?',
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
                    url: "/nhima/decline",
                    type: 'POST',
                    data: {
                        id: $('#de_npin_id').val(), 
                        token: $('#decline_token').val(), 
                        note: $('#reason').val(), 
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


    // Transaction Report/Analytics
   var nhima_report = $('#tbl_nhima_reports').DataTable({
    "select": {
        "style": 'multi'
    },
    "responsive": true,
    "processing": true,
    'language': {
        'loadingRecords': '&nbsp;',
        processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
        "emptyTable": "No NPINs to display"
    },
    "paging": true,
    "pageLength": 10,
    "serverSide": true,
    "ajax": {
        "type"   : "POST",
        "url"    : '/nhima/reports',
        "data"   : {
            "_csrf_token": $("#csrf").val(),
            "status": $("#status").val(),
            "npin": $("#npin").val(),
            "ref": $("#ref").val(),
            "amount": $("#amount").val(),
            "from": $("#from").val(),
            "to": $("#to").val()
        }
    },
    "columns": [
        {"data": "ref_id"},
        {"data": "employer_no"},
        {"data": "npin"},
        {"data": "amount"},
        {"data": "dr_acc"},
        {"data": "npin_date"},
        {
            "data": "status",
            "render": function (data, type, row) {
                return formartStatus(data)
            }
        },
        {
            "data": "id",
            "render": function (data, type, row) {
                if(row.status == "SUCCESS"){
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="#" data-id="'+data+'" class="dropdown-item text-info nhima_vw_dtls">View</a>'+
                            '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                        '</div>';
                }else{
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="#" data-id="'+data+'" class="dropdown-item text-info nhima_vw_dtls">View</a>'+
                        '</div>';
                }  
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

    //------------------NHIMA transactions table--------------------- 
    $('#btn_nhima_report_filter').on( 'click', function () {
        nhima_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.ref = $('#ref').val();
            data.npin = $('#npin').val();
            data.amount = $('#amount').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        nhima_report.draw();
    });

    $('#reload-report').on( 'click', function () {
        nhima_report.ajax.reload();
    });



    $('#tbl_nhima_reports tbody').on('click', '.nhima_vw_dtls', function () {
		$.ajax({
            url: "/nhima/pending/approval/details",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    nhima_pending_approval_details(result)
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



    //------------------RECIEPT--------------------------
    $('#tbl_nhima_reports').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
         $.ajax({
             url: "/nhima/reciept",
             type: 'POST',
             data: {
                 id: id, 
                 _csrf_token: $('#csrf').val()
             },
             success: function(result) {
                 if (result.data){
                     reciept_modal(result)
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




    function reciept_modal(result){
        console.log(result)
        var npin = result.data
        var txn_amount =  parseFloat(npin.amount) 
        var modal = $('#nhima_reciept')
        modal.find('.modal-body #payment_date').text(npin.payment_notif_date);
        modal.find('.modal-body #bank_ref').text(npin.cbs_ref);
        modal.find('.modal-body #emp_name').text(npin.employer_name);
        modal.find('.modal-body #emp_no').text(npin.employer_no);
        modal.find('.modal-body #emp_add').text("28675 Rubu Rd");
        modal.find('.modal-body #npin').text(npin.npin);
        modal.find('.modal-body #npin_date').text(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').text(npin.npin_exp_date);
        modal.find('.modal-body #npin_amount').text(txn_amount);
        modal.find('.modal-body #amount_words').text(npin.amount_words);
        $('#nhima_reciept').modal('show');
    }




    //-------------- Destroy datatable when modal closed----------
    $('#nhima_payment').on('hidden.bs.modal', function (event){
        $('#accounts').DataTable().clear().destroy();
    });

    $('#pending_appr_details_modal').on('hidden.bs.modal', function (event){
        $('#workflow').DataTable().clear().destroy();
    });

    $('#nhima_client_export_excel').on( 'click', function (event) {
        $('#nhimaSearchForm').attr('action', '/nhima/client/excel');
        $('#nhimaSearchForm').attr('method', 'GET');
        $("#nhimaSearchForm").submit();
    });

    $('#nhima_export_excel').on( 'click', function (event) {
        $('#nhimaSearchForm').attr('action', '/nhima/admin/excel');
        $('#nhimaSearchForm').attr('method', 'GET');
        $("#nhimaSearchForm").submit();
    });
  


  
});
