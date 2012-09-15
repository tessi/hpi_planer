window.hpi = {
  init: function() {
    $('#btn-edit-start').click(function(){ hpi.editCourses() });
    $('#btn-edit-confirm').click(function(){ hpi.stopEditingCourses() });
    $('#btn-add-row').click(function(){ hpi.addAnotherRow('hier reinklicken und editieren') });
    $('table#grades').on('click', 'td input[type=radio]', function () {
        hpi.saveToLocalStorage();
        hpi.fillOverview();
    });
    $(function() {
      $("#grades").tablesorter({headers: {
         1: { sorter: 'text' },
         3: { sorter: false },
         5: { sorter: false },
         6: { sorter: false },
         7: { sorter: false },
         8: { sorter: false },
         9: { sorter: false },
        10: { sorter: false },
        11: { sorter: false },
        12: { sorter: false },
        13: { sorter: false },
        14: { sorter: false },
        15: { sorter: false },
      }});
    });
    hpi.loadFromLocalStorage();
    hpi.fillOverview();
  },
  showEditButtons: function(mode /* true->default, false */) {
    if ( mode !== false ) mode = true;
    $.each([$('#btn-edit-start')], function(idx, val) {
      val.toggleClass('hidden', mode);
    });
    $.each([$('#btn-edit-confirm'), $('#btn-add-row')], function(idx, val) {
      val.toggleClass('hidden', !mode);
    });
  },
  editCourses: function() {
    $.each([$('table#grades > tbody'), $('#masterproject_grade'), $('#masterthesis_grade')], function(idx, element) {
      element.toggleClass('editing', true);
    });
    hpi.showEditButtons();
    hpi.enableEditingContent();
    hpi.replaceRadioButtonsWithCheckboxes();
  },
  stopEditingCourses: function() {
    $.each([$('table#grades > tbody'), $('#masterproject_grade'), $('#masterthesis_grade')], function(idx, element) {
      element.toggleClass('editing', false);
    });
    hpi.showEditButtons(false);
    hpi.enableEditingContent(false);
    hpi.replaceCheckboxesWithRadioButtons();
    hpi.saveToLocalStorage();
    hpi.fillOverview();
  },
  enableEditingContent: function(mode /* true->default, false*/) {
    if ( mode !== false ) mode = true;
    $.each([$('table#grades'), $('#masterproject_grade'), $('#masterthesis_grade')], function(idx, element) {
      element.attr('contentEditable', mode);
    });
    $('#grades > thead').attr('contentEditable', false);
  },
  addAnotherRow: function(text_for_first_row) {
    var row = $('<tr><td>' + text_for_first_row +'</td><td></td><td></td>' +
      new Array(12).join( '<td><input type="checkbox" /></td>' ) +
      '<td></td></tr>');
    $('#grades > tbody').prepend(row);
    $("#grades").trigger("update");
    return row;
  },
  replaceCheckboxesWithRadioButtons: function() {
    $('#grades > tbody tr').each(function(row_idx, row) {
      $(row).find('td input[type=checkbox]').each(function(idx, checkbox) {
        var radio = $("<input>",{
          type:'radio',
          name: row_idx,
          class: $(checkbox).is(':checked') ? '' : 'hidden'
        });
        if ( $(checkbox).data('was_checked') ) radio.attr('checked', 'checked');
        $(checkbox).replaceWith(radio);
      });
    });
  },
  replaceRadioButtonsWithCheckboxes: function() {
    $('#grades > tbody tr td input[type=radio]').each(function(idx, radio) {
      var checkbox = $("<input>",{
        type:'checkbox'
      });
      if ( !$(radio).hasClass('hidden') ) checkbox.attr('checked','checked');
      if ( $(radio).is(':checked') )      checkbox.data('was_checked', true);
      $(radio).replaceWith(checkbox);
    });
  },
  isEditing: function() {
    return $('table#grades > tbody').hasClass('editing');
  },
  isITSE: function(row) {
    return $(row).find('td:nth-child( 4) input:checked').size() > 0;
  },
  isSAMT: function(row) {
    return $(row).find('td:nth-child( 5) input:checked').size() > 0;
  },
  isOSIS: function(row) {
    return $(row).find('td:nth-child( 6) input:checked').size() > 0;
  },
  isIST: function(row) {
    return $(row).find('td:nth-child( 7) input:checked').size() > 0;
  },
  isHCT: function(row) {
    return $(row).find('td:nth-child( 8) input:checked').size() > 0;
  },
  isBPET: function(row) {
    return $(row).find('td:nth-child( 9) input:checked').size() > 0;
  },
  isSSKDT: function(row) {
    return $(row).find('td:nth-child(10) input:checked').size() > 0;
  },
  isSSKKO: function(row) {
    return $(row).find('td:nth-child(11) input:checked').size() > 0;
  },
  isSSKMA: function(row) {
    return $(row).find('td:nth-child(12) input:checked').size() > 0;
  },
  isSSKRE: function(row) {
    return $(row).find('td:nth-child(13) input:checked').size() > 0;
  },
  isSSKSK: function(row) {
    return $(row).find('td:nth-child(14) input:checked').size() > 0;
  },
  getGrade: function(row) {
    var grade = parseFloat( $(row).find('td:nth-child(15)').text() );
    return isNaN(grade) ? null : grade;
  },
  getPoints: function(row) {
    var points = parseFloat( $(row).find('td:nth-child(3)').text() );
    return isNaN(points) ? null : points;
  },
  courseType: function(row) {
    if ( hpi.isITSE(row)  ) return 'itse';
    if ( hpi.isSAMT(row)  ) return 'samt';
    if ( hpi.isOSIS(row)  ) return 'osis';
    if ( hpi.isIST(row)   ) return 'ist';
    if ( hpi.isHCT(row)   ) return 'hct';
    if ( hpi.isBPET(row)  ) return 'bpet';
    if ( hpi.isSSKDT(row) ) return 'sskdt';
    if ( hpi.isSSKKO(row) ) return 'sskko';
    if ( hpi.isSSKMA(row) ) return 'sskma';
    if ( hpi.isSSKRE(row) ) return 'sskre';
    if ( hpi.isSSKSK(row) ) return 'ssksk';
  },
  collectGrades: function() {
    var grades = {
      itse:  [], samt:  [], osis:  [], ist:   [], hct:   [], bpet: [],
      sskdt: [], sskko: [], sskma: [], sskre: [], ssksk: []
    };
    $('#grades > tbody tr').each(function(row_idx, row) {
      var points, grade, type;
      row    = $(row);
      points = hpi.getPoints(row);
      grade  = hpi.getGrade(row);
      type   = hpi.courseType(row);
      if ( points && grade && type) {
        grades[type].push( [grade, points] );
        row.toggleClass('error', false);
      } else {
        row.toggleClass('error', true);
      }
    });
    return grades;
  },
  getMasterprojectGrade: function() {
    var grade = parseFloat( $('#masterproject_grade').text() );
    grade = isNaN(grade) ? null : grade;
    if ( grade ) {
      $('#masterproject_lp').text( $('#masterproject_lp_orig').text() );
      $('#masterproject').toggleClass('error', false);
    } else {
      $('#masterproject_lp').text('-');
      $('#masterproject').toggleClass('error', true);
    }
    return grade;
  },
  getMasterthesisGrade: function() {
    var grade = parseFloat( $('#masterthesis_grade').text() );
    grade = isNaN(grade) ? null : grade;
    if ( grade ) {
      $('#masterthesis_lp').text( $('#masterthesis_lp_orig').text() );
      $('#masterthesis').toggleClass('error', false);
    } else {
      $('#masterthesis_lp').text('-');
      $('#masterthesis').toggleClass('error', true);
    }
    return grade;
  },
  sumupGrades: function( grades, maxLP, factorLp ) {
    var sum_grade = 0, sum_count = 0, sum_lp = 0, pos = 0;
    grades.sort(function(a,b){
      if ( a[0] < b[0] ) return -1;
      if ( a[0] > b[0] ) return  1;
      return 0;
    });
    if ( maxLP < factorLp ) factorLp = maxLP;
    while ( (sum_lp < maxLP) && (pos < grades.length) ) {
      if ( sum_lp < factorLp ) {
        if ( sum_lp + grades[pos][1] > factorLp ) {
          var factored_lp, rest_lp;
          factored_lp = factorLp - sum_lp;
          rest_lp     = grades[pos][1] - factored_lp;
          sum_grade += 3 * grades[pos][0] * factored_lp;
          sum_count += 3 * factored_lp;
          sum_lp += factored_lp;
          if ( sum_lp < maxLP ) {
            if ( sum_lp + rest_lp > maxLP ) {
              var calc_lp = maxLP - sum_lp;
              sum_grade += grades[pos][0] * calc_lp;
              sum_count += calc_lp;
              sum_lp    += calc_lp;
            } else {
              sum_grade += grades[pos][0] * rest_lp;
              sum_count += rest_lp;
              sum_lp    += rest_lp;
            }
          }
        } else {
          sum_grade += 3 * grades[pos][0] * grades[pos][1];
          sum_count += 3 * grades[pos][1];
          sum_lp += grades[pos][1];
        }
      } else {
        if ( sum_lp + grades[pos][1] > maxLP ) {
          var calc_lp = maxLP - sum_lp;
          sum_grade += grades[pos][0] * calc_lp;
          sum_count += calc_lp;
          sum_lp    += calc_lp;
        } else {
          sum_grade += grades[pos][0] * grades[pos][1];
          sum_count += grades[pos][1];
          sum_lp    += grades[pos][1];
        }
      }
      pos++;
    }
    /* [average_grade, summed_weight, used_lp] */
    return [sum_grade / sum_count, sum_count, sum_lp];
  },
  getSskLp: function(ssktype) {
    var lp = 0;
    $('#grades > tbody tr').each(function(row_idx, row) {
      var points, type;
      row    = $(row);
      points = hpi.getPoints(row);
      type   = hpi.courseType(row);
      if ( points && type) {
        if ( type == 'ssk' + ssktype )
          lp += points;
        row.toggleClass('error', false);
      } else {
        row.toggleClass('error', true);
      }
    });
    if (ssktype == 'dt')
      return lp > 12 ? 12 : lp;
    return lp > 6 ? 6 : lp;
  },
  getSskLpSum: function() {
    return hpi.getSskLp('ma') + hpi.getSskLp('dt') + hpi.getSskLp('ko') + hpi.getSskLp('re') + hpi.getSskLp('sk');
  },
  fillOverview: function() {
    var grades = hpi.collectGrades(),
        masterproject_grade = hpi.getMasterprojectGrade(),
        masterthesis_grade  = hpi.getMasterthesisGrade(),
        itse_data = hpi.sumupGrades(grades.itse, 24, 18),
        samt_data = hpi.sumupGrades(grades.samt, 24, 18),
        osis_data = hpi.sumupGrades(grades.osis, 24, 18),
        ist_data = hpi.sumupGrades(grades.ist, 24, 18),
        hct_data = hpi.sumupGrades(grades.hct, 24, 18),
        bpet_data = hpi.sumupGrades(grades.bpet, 24, 18),
        courses, vt1_data, vt2_data, ssk, sskma, final_grade, final_lp;
    $('#itse_lp').text(itse_data[2]);
    $('#itse_grade').text(itse_data[0] ? itse_data[0].toFixed(2) : '');
    $('#itse').toggleClass( 'error', itse_data[2] < 24 );
    courses = [['samt',samt_data], ['osis', osis_data], ['ist', ist_data], ['hct', hct_data], ['bpet', bpet_data]];
    courses.sort(function(a,b){
      if ( a[1][2] > b[1][2] ) return -1;
      if ( a[1][2] < b[1][2] ) return  1;
      return 0;
    });
    vt1_data = courses[0][1];
    $('#vt1_lp').text(vt1_data[2]);
    $('#vt1_grade').text(vt1_data[0] ? vt1_data[0].toFixed(2) : '');
    $('#vt1_weight').text(courses[0][0]);
    $('#vt1').toggleClass( 'error', vt1_data[2] < 24 );
    vt2_data = hpi.sumupGrades(grades[courses[1][0]], 15, 9);
    $('#vt2_lp').text(vt2_data[2]);
    $('#vt2_grade').text(vt2_data[0] ? vt2_data[0].toFixed(2) : '');
    $('#vt2_weight').text(courses[1][0]);
    $('#vt2').toggleClass( 'error', vt2_data[2] < 15 );
    sskma = hpi.getSskLp('ma');
    $('#sskma_lp').text(sskma);
    $('#sskma').toggleClass( 'error', sskma < 6 );
    ssk = hpi.getSskLpSum();
    $('#ssk').toggleClass( 'error', ssk < 18 );
    $('#ssk_lp').text(ssk);
    final_grade = 0;
    final_lp = 0;
    if ( masterthesis_grade ) {
      final_grade += masterthesis_grade * 3 * 30;
      final_lp += 3 * 30;
    }
    if ( masterproject_grade ) {
      final_grade += masterproject_grade * 3 * 9;
      final_lp += 3 * 9;
    }
    if ( itse_data[0] ) {
      final_grade += itse_data[0] * itse_data[1];
      final_lp += itse_data[1];
    }
    if ( vt1_data[0] ) {
      final_grade += vt1_data[0] * vt1_data[1];
      final_lp += vt1_data[1];
    }
    if ( vt2_data[0] ) {
      final_grade += vt2_data[0] * vt2_data[1];
      final_lp += vt2_data[1];
    }
    final_grade = final_grade / final_lp;
    $('#final_grade').text( final_grade.toFixed(2) );
  },
  extractJsonFromInput: function(input) {
    var json = {};
    if ( input.attr('type') == 'radio' ) {
      json['active']   = !input.hasClass('hidden');
      json['selected'] = !!input.is(':checked');
    } else { // checkbox
      json['active']   = !!input.is(':checked');
      json['selected'] = !!input.data('was_checked');
    }
    return json;
  },
  extractJson: function() {
    var json = {}, tmp;
    json['masterprojectgrade'] = hpi.getMasterprojectGrade();
    json['masterthesisgrade']  = hpi.getMasterthesisGrade();
    json['rows'] = [];
    $('#grades > tbody tr').each(function(row_idx, row) {
      row = $(row);
      tmp = [
        $.trim(row.find('td:nth-child( 1)').text()),                    // course name
        $.trim(row.find('td:nth-child( 2)').text()),                    // semester
        $.trim(row.find('td:nth-child( 3)').text()),                    // lp
        hpi.extractJsonFromInput( row.find('td:nth-child( 4) input') ), // itse
        hpi.extractJsonFromInput( row.find('td:nth-child( 5) input') ), // samt
        hpi.extractJsonFromInput( row.find('td:nth-child( 6) input') ), // osis
        hpi.extractJsonFromInput( row.find('td:nth-child( 7) input') ), // ist
        hpi.extractJsonFromInput( row.find('td:nth-child( 8) input') ), // hct
        hpi.extractJsonFromInput( row.find('td:nth-child( 9) input') ), // bpet
        hpi.extractJsonFromInput( row.find('td:nth-child(10) input') ), // sskdt
        hpi.extractJsonFromInput( row.find('td:nth-child(11) input') ), // sskko
        hpi.extractJsonFromInput( row.find('td:nth-child(12) input') ), // sskma
        hpi.extractJsonFromInput( row.find('td:nth-child(13) input') ), // sskre
        hpi.extractJsonFromInput( row.find('td:nth-child(14) input') ), // ssksk
        $.trim(row.find('td:nth-child(15)').text())                     // grade
      ];
      json.rows.push(tmp);
    });
    return json;
  },
  applyJson: function(json) {
    var row_elem;
    if ( json.masterprojectgrade ) $('#masterproject_grade').text( json.masterprojectgrade.toFixed(1) );
    if ( json.masterthesisgrade ) $('#masterthesis_grade').text( json.masterthesisgrade.toFixed(1) );
    // delete all existing courses
    $('#grades > tbody tr').each(function(row_idx, row) {
      $(row).remove();
    });
    // add rows from json
    if ( json.rows ) for (var i = json.rows.length - 1; i >= 0; i--) {
      row_elem = hpi.addAnotherRow( json.rows[i][0] );
      row_elem.find('td:nth-child( 2)').text( json.rows[i][1] );
      row_elem.find('td:nth-child( 3)').text( json.rows[i][2] );
      if ( json.rows[i][ 3].active )   row_elem.find('td:nth-child( 4) input').attr('checked', 'checked');
      if ( json.rows[i][ 3].selected ) row_elem.find('td:nth-child( 4) input').data('was_checked', true);
      if ( json.rows[i][ 4].active )   row_elem.find('td:nth-child( 5) input').attr('checked', 'checked');
      if ( json.rows[i][ 4].selected ) row_elem.find('td:nth-child( 5) input').data('was_checked', true);
      if ( json.rows[i][ 5].active )   row_elem.find('td:nth-child( 6) input').attr('checked', 'checked');
      if ( json.rows[i][ 5].selected ) row_elem.find('td:nth-child( 6) input').data('was_checked', true);
      if ( json.rows[i][ 6].active )   row_elem.find('td:nth-child( 7) input').attr('checked', 'checked');
      if ( json.rows[i][ 6].selected ) row_elem.find('td:nth-child( 7) input').data('was_checked', true);
      if ( json.rows[i][ 7].active )   row_elem.find('td:nth-child( 8) input').attr('checked', 'checked');
      if ( json.rows[i][ 7].selected ) row_elem.find('td:nth-child( 8) input').data('was_checked', true);
      if ( json.rows[i][ 8].active )   row_elem.find('td:nth-child( 9) input').attr('checked', 'checked');
      if ( json.rows[i][ 8].selected ) row_elem.find('td:nth-child( 9) input').data('was_checked', true);
      if ( json.rows[i][ 9].active )   row_elem.find('td:nth-child(10) input').attr('checked', 'checked');
      if ( json.rows[i][ 9].selected ) row_elem.find('td:nth-child(10) input').data('was_checked', true);
      if ( json.rows[i][10].active )   row_elem.find('td:nth-child(11) input').attr('checked', 'checked');
      if ( json.rows[i][10].selected ) row_elem.find('td:nth-child(11) input').data('was_checked', true);
      if ( json.rows[i][11].active )   row_elem.find('td:nth-child(12) input').attr('checked', 'checked');
      if ( json.rows[i][11].selected ) row_elem.find('td:nth-child(12) input').data('was_checked', true);
      if ( json.rows[i][12].active )   row_elem.find('td:nth-child(13) input').attr('checked', 'checked');
      if ( json.rows[i][12].selected ) row_elem.find('td:nth-child(13) input').data('was_checked', true);
      if ( json.rows[i][13].active )   row_elem.find('td:nth-child(14) input').attr('checked', 'checked');
      if ( json.rows[i][13].selected ) row_elem.find('td:nth-child(14) input').data('was_checked', true);
      row_elem.find('td:nth-child( 15)').text( json.rows[i][14] );
    };
    if ( !hpi.isEditing() ) hpi.replaceCheckboxesWithRadioButtons();
  },
  saveToLocalStorage: function() {
    var json = hpi.extractJson();
    localStorage.setItem('course_data', JSON.stringify(json));
  },
  loadFromLocalStorage: function() {
    var json = JSON.parse(localStorage.getItem('course_data'));
    if (json) hpi.applyJson(json);
  }
}
