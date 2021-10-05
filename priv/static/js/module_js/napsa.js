
$(document).ajaxStart($.blockUI);
$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);
    //approval modal data passing

    function formartAmount(amt) {
        return Number(amt).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } 

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



    $('#npin_details').on('show.bs.modal', function (event){
         var button = $(event.relatedTarget)
         var modal = $(this)
 
         modal.find('.modal-body #npin').val(button.data('npin'));
         modal.find('.modal-body #emp_name').val(button.data('emp_name'));
         modal.find('.modal-body #amount').val(button.data('amount'));
         modal.find('.modal-body #date').val(button.data('date'));
         modal.find('.modal-body #exp_date').val(button.data('exp_date'));
         
     });

     //------------drop npin---------
    $('.drop_npin').on( 'click', function (event) {
        var id = $(event.target).attr("data-id");
        console.log("iiiiiiiiiiiiieeeeeeeeeeeeeeeeeee")
        var modal = $('#drop_napsa_modal');
        modal.find('.modal-body #drop_payment_id').val(id);
        $('#drop_napsa_modal').modal('show');
    });

    //------------------ DROP PAYMENT --------------------------
    $('#drop_napsa_btn').on( 'click', function () {
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
                    url: "/napsa/npin/drop",
                    type: 'POST',
                    data: {
                        id: $('#drop_payment_id').val(), 
                        note: $('#drop_note').val(),
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


    //------------drop npin---------
    // $('.drop_npin').on( 'click', function (event) {
    //     Swal.fire({
    //         title: 'Are you sure you want to drop NPIN?',
    //         text: "proceed To Drop NPIN",
    //         type: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, continue!',
    //         showLoaderOnConfirm: true
    //         }).then((result) => {
    //         if (result.value) {

    //             $.ajax({
    //                 url: "/napsa/npin/drop",
    //                 type: 'POST',
    //                 data: {
    //                     id: $(event.target).attr("data-id"), 
    //                     _csrf_token: $('#csrf').val()
    //                 },
    //                 success: function(result) {
    //                     if (result.data){
    //                         if (result.data){
    //                             Swal.fire(
    //                                 'Success',
    //                                 result.data,
    //                                 'success'
    //                             )   
    //                         }else{
    //                             Swal.fire(
    //                                 'Oops..',
    //                                 result.error,
    //                                 'error'
    //                             )
    //                         }
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

    //---------------------display submission result -----------
    function napsa_select_acc_modal(result){
        var npin = result.npin
        var accounts = result.accounts
        var amount = parseFloat(npin.amount)
        var charge = parseFloat($('#txn_charge').val())
        var total_amount = amount+charge
        var modal = $('#napsa_payment')


        modal.find('.modal-body #payment_npin').val(npin.npin);
        modal.find('.modal-body #total_amount').val(total_amount);
        modal.find('.modal-body #charge').text(charge);
        modal.find('.modal-body #total').text(total_amount);
        $('#accounts').DataTable( {
            language: {"emptyTable": "Bank connectivity unavailable"},
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
                    return '<input type="radio" name="napsa_dr_acc" data-brn="'+row.branch_code+'" value="'+account+'">';                  
                }
            }
            ]
        });
        $('#napsa_payment').modal('show');
    }

    //------------ RETAIL NAPSA PAYMENT---------
    $('.init_npin').on( 'click', function (event) {
        // $.blockUI();
        $.ajax({
            url: "/napsa/confirmation",
            type: 'POST',
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    napsa_select_acc_modal(result)
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


    //------------napsa submit---------
    $('#napsa_submit').on( 'click', function (event) {
        var acc_radio = $("input[type='radio'][name='napsa_dr_acc']:checked")
        //var dr_acc = $("input[name='napsa_dr_acc']:checked").val();
        $('#napsa_payment').modal('hide');
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
                    url: "/napsa/init/payment",
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


    function pending_appr_details(result){
        var npin = result.npin
        var workflow = result.workflow
        var modal = $('#pending_appr_details_modal')

        modal.find('.modal-body #payment_npin').val(npin.npin);
        modal.find('.modal-body #npin').val(npin.npin);
        modal.find('.modal-body #amount').val(npin.amount);
        modal.find('.modal-body #dr_acc').val(npin.dr_acc);
        modal.find('.modal-body #npin_date').val(npin.npin_date);
        modal.find('.modal-body #npin_exp_date').val(npin.npin_exp_date);
        modal.find('.modal-body #emp_no').val(npin.employer_no);
        modal.find('.modal-body #emp_name').val(npin.employer_name);
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
            {"data": "status"},
            ]
        });
        $('#pending_appr_details_modal').modal('show');
    }


    $('.view_npin_details').on( 'click', function (event) {
        $.ajax({
            url: "/napsa/pending/approval/details",
            type: 'POST',
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    pending_appr_details(result)
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


    $('#approve_npin_btn').on( 'click', function (event) {


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
                //$.blockUI();
                $.ajax({
                    url: "/napsa/approve",
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


    $('#decline_npin_btn').on( 'click', function (event) {

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
                    url: "/napsa/decline",
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
                '<td>Bank ref: '+format_value(d.cbs_ref)+'</td>'+
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



   var tbl_napsa_report = $('#tbl_reports').DataTable({
    "select": {
        "style": 'multi'
    },
    "responsive": true,
    "processing": true,
    'language': {
        'loadingRecords': '&nbsp;',
        processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
        "emptyTable": "No NPIN's to display"
    },
    "paging": true,
    "pageLength": 10,
    "serverSide": true,
    "ajax": {
        "type"   : "POST",
        "url"    : '/napsa/reports/me',
        "data"   : {
            "_csrf_token": $("#csrf").val(),
            "status": $("#status").val(),
            "npin": $("#nnpin").val(),
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
        {"data": "npin"},
        {
            "data": "amount",
            "render": function ( data, type, row ) {
                if(data){
                    return formartAmount(data.replace(/\,/g, ''));
                } else{
                    "<span class='text-danger'>Not Set</span>"
                }
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
                if(row.status == "SUCCESS"){
                    return '<button class="btn btn-xs text-white" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_npin_details">View</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                    '</div>';
                }
                else{
                    return '<button class="btn btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info view_npin_details">View</a>'+
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



    $('#tbl_reports').on('click', 'td.details-control', function () {
		var tr = $(this).closest('tr');
		var row = tbl_napsa_report.row(tr);

		if (row.child.isShown()) {
			row.child.hide();
			tr.removeClass('shown');
		}
		else {
			row.child(formatSearchDetails(row.data())).show();
			tr.addClass('shown');
		}
	});

    //------------------NAPSA transactions table--------------------- 
    $('#btn_napsa_report_filter').on( 'click', function () {
        tbl_napsa_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.ref = $('#ref').val();
            data.npin = $('#nnpin').val();
            data.amount = $('#amount').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        tbl_napsa_report.draw();
    });

    $('#reload-report').on( 'click', function () {
        tbl_napsa_report.ajax.reload();
    });



    $('#tbl_reports tbody').on('click', '.view_npin_details', function () {
		$.ajax({
            url: "/napsa/pending/approval/details",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.npin){
                    pending_appr_details(result)
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
    $('#tbl_reports').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
         $.ajax({
             url: "/napsa/reciept",
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
        var modal = $('#napsa_reciept')
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
        $('#napsa_reciept').modal('show');
    }

    $('#client_export_excel').on( 'click', function (event) {
        $('#napsaSearchForm').attr('action', '/napsa/client/excel');
        $('#napsaSearchForm').attr('method', 'GET');
        $("#napsaSearchForm").submit();
    });




    //-------------- Destroy datatable when modal closed----------
    $('#napsa_payment').on('hidden.bs.modal', function (event){
        $('#accounts').DataTable().clear().destroy();
    });

    $('#pending_appr_details_modal').on('hidden.bs.modal', function (event){
        $('#workflow').DataTable().clear().destroy();
    });

    $('#dt-pending_bank').DataTable({});
    $('#dt_approval_tray').DataTable({});
    $('#dt_pending_approval').DataTable({}); 
    $('#dt-active_npins').DataTable({});

  
});



