


// ----------------------------------------- Sweet Alert
$(document).ajaxStop($.unblockUI);
$(document).ready(function() {



    function formatSearchDetails ( d ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Debit Account: '+format_value(d.dr_acc_num)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Credit Account: '+format_value(d.cr_acc_num)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>CBS Ref: '+format_value(d.payment_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Payment Date: '+format_value(d.proc_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Status Description: '+format_value(d.status_descript)+'</td>'+
            '</tr>'+
        '</table>';
    }

    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "BLOCKED"){
            stat = "<span class='text-primary'>BLOCKED</span>";
        }else if(status == "FAILED"){
            stat = "<span class='text-danger'>FAILED</span>";
        }else{
            stat =status
        }
        return stat;
    }


   
    var tbl_fee_admin_report = $('#fee_admin_report').DataTable({
        searching: false,
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Charges"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/fee/admin/reports',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "status": $("#filter_status").val(),
                "category": $("#filter_category").val(),
                "ref": $("#filter_ref").val(),
                "txn_mode": $("#filter_txn_mode").val(),
                "from": $("#filter_from").val(),
                "to": $("#filter_to").val()
            }
        },
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "fee_category"},
            {"data": "fee_descript"},
            {"data": "item_ref"},
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
            {"data": "txn_mode"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return "<span class='text-danger'>No Action</span>"
                }
            } 
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[7, 'asc']],
            responsive: true,
            lengthChange: false,
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
        });

    $('#btn_general_admin_filter').on( 'click', function () {
        tbl_fee_admin_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.ref = $('#filter_ref').val();
            data.category = $('#filter_category').val();
            data.txn_mode = $('#filter_txn_mode').val();
            data.status = $('#filter_status').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#filter').modal('hide');
        tbl_fee_admin_report.draw();
    });

    $('#reload_table').on( 'click', function () {
		tbl_fee_admin_report.ajax.reload();
    });

    $('#fee_admin_report').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_fee_admin_report.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });


    $('#transaction_fee_export_excel').on( 'click', function (event) {
        $('#reportSearchForm').attr('action', '/transaction/charges/admin/excel');
        $('#reportSearchForm').attr('method', 'GET');
        $("#reportSearchForm").submit();
    });
});



