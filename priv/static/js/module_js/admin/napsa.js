


// ----------------------------------------- Sweet Alert
$(document).ajaxStop($.unblockUI);
$(document).ready(function() { 
    $(document).ajaxStop($.unblockUI);

    function formatSearchDetails ( d ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Employer No: '+format_value(d.employer_no)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank ref: '+format_value(d.cbs_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Debit Account: '+format_value(d.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Credit Account: '+format_value(d.cr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>NPIN Date: '+format_value(d.npin_exp_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(d.initiator_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Approved: '+format_value(d.approver_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank Payment Description: '+format_value(d.payment_status)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>NAPSA Notification Status: '+format_value(d.payment_notif_status)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>NAPSA Notification Description: '+format_value(d.payment_notif_status_descript)+'</td>'+
            '</tr>'+
        '</table>';
    }

    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else if(status == "FAILED_PAYMENT"){
            stat = "<span class='text-danger'>FAILED BANK PAYMENT</span>";
        }else if(status == "FAILED_NOTIFICATION"){
            stat = "<span class='text-danger'>FAILED NAPSA NOTIFICATION</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-danger'>"+status+"</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-info'>PENDING BANK PAYMENT</span>";
        }else if(status == "PENDING_NOTIFICATION"){
            stat = "<span class='text-info'>PENDING NOTIFICATION</span>";
        }else{
            stat =status
        }
        return stat; 
    }


    function button_options(data, row){
        var init_btn ='<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
        var rcpt_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>';
        var trail_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Trial</a></div>';
        var notif_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success napsa_reset_notif">Retry Notification</a>';
        var pay_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success napsa_reset_payment">Retry payment</a>';
        var drop_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success napsa_drop_payment">Drop payment</a>';
        var status = row.status;

        
        if(status == "SUCCESS"){
            return init_btn+rcpt_btn+trail_btn
        }else if((status == "DROPPED") || (status == "DECLINED") || (status == "PENDING_APPROVAL") || (status == "PENDING_BANK_PAYMENT") || (status == "PENDING_NOTIFICATION")){
            return init_btn+trail_btn;
        }else if(status == "FAILED_NOTIFICATION"){
            return init_btn+notif_btn+trail_btn;
        }else if(status == "FAILED_PAYMENT"){
            return init_btn+pay_btn+trail_btn;
        }else{
            return '<span class="text-danger">No Actions</span>';
        }
    }

    var tbl_napsa_admin_report = $('#napsa_admin').DataTable({
        searching: false,
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "Empty"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/napsa/admin/report',
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
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "ref_id"},
            {"data": "employer_name"},
            {"data": "npin"},
            {
                "data": "amount",
                "render": function ( data, type, row ) {
                    return formartAmount(data.replace(/\,/g, ''));
                }
            },
            {"data": "npin_exp_date"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)   
                }
            }, 
            {
                "data": "id",
                "render": function (data, type, row) {
                    return button_options(data, row) 
                }
            } 
        ],
        "columnDefs": [
			{
				targets: [2],
				render: $.fn.dataTable.render.ellipsis( 25, true, true)
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

    $('#reload_table').on( 'click', function () {
        tbl_napsa_admin_report.ajax.reload();
    });


        //------------------NAPSA transactions table--------------------- 
    $('#btn_napsa_admin_report_filter').on( 'click', function () {
        tbl_napsa_admin_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.ref = $('#ref').val();
            data.npin = $('#npin').val();
            data.amount = $('#amount').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        tbl_napsa_admin_report.draw();
    });

    $('#napsa_admin').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_napsa_admin_report.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    // ------------------ DROP PAYMENT ------------------//
    //
    $('#napsa_admin').on('click', '.napsa_drop_payment', function() {
        var btn = $(this);
        var id = btn.attr("data-id");

        Swal.fire({
            title: 'Are you sure you want to drop Payment?',
            text: "Proceed to drop payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/napsa/admin/payment/drop",
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
            } else {
                Swal.fire(
                    'Cancelled',
                    'Drop operation cancelled!',
                    'error'
                )
            }
        })
            
    
    });

    //------------------RECIEPT--------------------------
    $('#napsa_admin').on('click', '.reciept', function() {
        $.blockUI();
        $.ajax({
            url: "/napsa/reciept",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"), 
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
        var npin = result.data
        var txn_amount =  parseFloat(npin.amount) 
        var modal = $('#napsa_reciept')
        modal.find('.modal-body #payment_date').text(npin.payment_notif_date);
        modal.find('.modal-body #bank_ref').text(npin.cbs_ref);
        modal.find('.modal-body #emp_name').text(npin.employer_name);
        modal.find('.modal-body #emp_no').text(npin.employer_no);
        modal.find('.modal-body #emp_add').text("address here");
        modal.find('.modal-body #npin').text(npin.npin);
        modal.find('.modal-body #npin_date').text(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').text(npin.npin_exp_date);
        modal.find('.modal-body #npin_amount').text(txn_amount);
        modal.find('.modal-body #amount_words').text(npin.amount_words);
        $('#napsa_reciept').modal('show');
    }




    $('#napsa_admin').on('click', '.approval_tray', function() {
        $.blockUI();
        $.ajax({
            url: "/report/approval/trial",
            type: 'POST',
            data: {
                ref_id: $(this).attr("data-ref_id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    approval_trial_modal(result.data)
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


    //------------RESET NOTIFICATION TRY---------
    $('#napsa_admin tbody').on( 'click', '.napsa_reset_notif', function (event) {
        Swal.fire({
            title: 'Are you sure you want to try NAPSA Notification?',
            text: "proceed To Try Notification",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: "/napsa/admin/reset/notif",
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
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );  
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

    //------------RESET NOTIFICATION TRIES---------
    
    $('#napsa_admin tbody').on( 'click', '.napsa_reset_payment', function (event) {
        Swal.fire({
            title: 'Are you sure you want to retry Bank payment?',
            text: "proceed With Payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: "/napsa/admin/reset/bankpayment",
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
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );  
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

    $('#admin_export_excel').on( 'click', function (event) {
        $('#napsaSearchForm').attr('action', '/napsa/admin/excel');
        $('#napsaSearchForm').attr('method', 'GET');
        $("#napsaSearchForm").submit();
    });


    //------------TEST SERVICE---------
    $('#test_napsa').on( 'click', function () {
        $.blockUI();
        $.ajax({
            url: "/napsa/admin/test",
            type: 'POST',
            data: {
                npin: $('#test_napsa_npin').val(), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    if (result.data){
                        npin_details(result.data)  
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

    function npin_details(npin){
        var modal = $('#npin_details_modal')

        modal.find('.modal-body #npin').val(npin.npin);
        modal.find('.modal-body #amount').val(npin.amount);
        modal.find('.modal-body #exp_date').val(npin.npin_exp_date);
        modal.find('.modal-body #emp_name').val(npin.emp_name);

        $('#npin_details_modal').modal('show');
    }


    



});



