$(document).ajaxStart($.blockUI);
$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);


    // Admin transaction table
   var tbl_nhima_admin_report = $('#nhima_admin').DataTable({
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
        "url"    : '/nhima/admin/report',
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
        {"data": "employer_no"},
        {"data": "employer_name"},
        {"data": "npin"},
        {
            "data": "amount",
            "render": function ( data, type, row ) {
                return formartAmount(data.replace(/\,/g, ''));
            }
        },
        {"data": "dr_acc"},
        {
            "data": "status",
            "render": function (data, type, row) {
                return formartStatus(data)
            }
        },
        {
            "data": "id",
            "render": function (data, type, row) {
                var options = null;
                var status = row.status;
                if(status == "SUCCESS"){
                    options= '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info nhima_vw_dtls">View</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                    '</div>';
                }else if(status == "FAILED_PAYMENT"){
                    options= '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info reset_payment">Retry Payment</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success mark_ok">Mark As Complete</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-danger drop_payment">Drop Payment</a>'+
                    '</div>';
                }else if(status == "FAILED_NOTIFICATION"){
                    options= '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reset_notif">Retry Notification</a>'+
                    '</div>';
                }else{
                    options= '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info nhima_vw_dtls">View</a>'+
                    '</div>';
                };
                return options;
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

    function format_value(v) {
        if(v){
            return v;
        } else{
            return "<span class='text-danger'>Not Set</span>";
        }
    }

    function formatSearchDetails ( d ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Charge: '+format_value(d.charge)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>NPIN Date: '+format_value(d.npin_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>NPIN Expiry Date: '+format_value(d.npin_exp_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(d.initiator_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Approved: '+format_value(d.approver_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Credit Account: '+format_value(d.cr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Credit Account Branch: '+format_value(d.cr_acc_brn)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank ref: '+format_value(d.cbs_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Notification Status: '+format_value(d.payment_notif_status)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Notification Status Description: '+format_value(d.payment_notif_status_descript)+'</td>'+
            '</tr>'+
        '</table>';
    }

    $('#nhima_admin').on('click', 'td.details-control', function () {
		var tr = $(this).closest('tr');
		var row = tbl_nhima_admin_report.row(tr);

		if (row.child.isShown()) {
			row.child.hide();
			tr.removeClass('shown');
		}
		else {
			row.child(formatSearchDetails(row.data())).show();
			tr.addClass('shown');
		}
	});

    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-info'>PENDING BANK PAYMENT</span>";
        }else if(status == "PENDING_NOTIFICATION"){
            stat = "<span class='text-info'>PENDING NOTIFICATION</span>";
        }else if(status == "FAILED_PAYMENT"){
            stat = "<span class='text-danger'>FAILED BANK PAYMENT</span>";
        }else if(status == "FAILED_NOTIFICATION"){
            stat = "<span class='text-danger'>FAILED NOTIFICATION</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-info'>"+status+"</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else{
            stat = "<span class='text-info'>"+status+"</span>";
        }
        return stat;
    }

    //------------------RECIEPT--------------------------
    $('#nhima_admin').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
            $.blockUI();
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

    //------------------NHIMA transactions table--------------------- 
    $('#btn_nhima_report_filter').on( 'click', function () {
        tbl_nhima_admin_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.ref = $('#ref').val();
            data.npin = $('#npin').val();
            data.amount = $('#amount').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        });
        $('#filter').modal('hide');
        tbl_nhima_admin_report.draw();
    });

    $('#reload-report').on( 'click', function () {
        tbl_nhima_admin_report.ajax.reload();
    });


    //------------RESET PAYMENT TRY---------
    $('#nhima_admin tbody').on( 'click', '.reset_payment', function (event) {
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
                $.blockUI();
                $.ajax({
                    url: "/nhima/admin/reset/payment",
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

    //------------RESET NOTIFICATION TRY---------
    $('#nhima_admin tbody').on( 'click', '.reset_notif', function (event) {
        Swal.fire({
            title: 'Are you sure you want to try NHIMA Notification?',
            text: "proceed To Try Notification",
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
                    url: "/nhima/admin/reset/notif",
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

    //------------- DROP TRANSACTION ---------------
    $('#nhima_admin tbody').on( 'click', '.drop_payment', function (event) {
        var id = $(event.target).attr("data-id");
        var modal = $('#drop_payment')
        modal.find('.modal-body #id').val(id);
        modal.modal('show');
                   
    });

    //------------- Mark complete ---------------
    $('#nhima_admin tbody').on( 'click', '.mark_ok', function (event) {
        var id = $(event.target).attr("data-id");
        var modal = $('#mark_complete')
        modal.find('.modal-body #id').val(id);
        modal.modal('show');             
    });





    //------------TEST SERVICE---------
    $('#test_nhima').on( 'click', function () {
        $.blockUI();
        $.ajax({
            url: "/nhima/admin/test",
            type: 'POST',
            data: {
                npin: $('#test_nhima_npin').val(), 
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

