// Generated by CoffeeScript 1.3.3
(function() {

  window.hpi = {
    init: function() {
      $("#btn-close-info-window").click(function() {
        return hpi.closeKeyboardShortcutInfo();
      });
      $("#btn-edit-start").click(function() {
        return hpi.editCourses();
      });
      $("#btn-edit-confirm").click(function() {
        return hpi.stopEditingCourses();
      });
      $("#btn-add-row").click(function() {
        return hpi.newCourse();
      });
      $("table#grades").on("click", "td input[type=radio]", function() {
        hpi.saveToLocalStorage();
        return hpi.fillOverview();
      });
      $("#download_data").click(function() {
        var blob, button;
        blob = new Blob([JSON.stringify(hpi.extractJson())], {
          type: "application/octet-stream"
        });
        button = $(this);
        button.attr("href", URL.createObjectURL(blob));
        return button.attr("download", "hpi_masterplan.json");
      });
      $("#restore_data").click(function() {
        var button, file, fileList, reader;
        button = $(this);
        fileList = $("#file_to_restore")[0].files;
        $("#file_upload_info").toggleClass("hidden", fileList.length > 0);
        if (fileList.length = 0) {
          return;
        }
        file = fileList[0];
        reader = new FileReader();
        reader.onload = function(evt) {
          var json;
          json = JSON.parse(evt.target.result);
          if (json) {
            hpi.applyJson(json);
            return hpi.saveToLocalStorage();
          }
        };
        return reader.readAsText(file);
      });
      hpi.initKeyboardShortcuts();
      hpi.editables = [$("#grades > tbody"), $("#masterproject_grade"), $("#masterthesis_grade")];
      $('#grades').on('click', '.editing td', function(event) {
        var checkbox, target;
        target = $(event.target);
        if (target.parent('.editing')) {
          checkbox = target.children('input[type=checkbox]');
          if (checkbox.length > 0) {
            return checkbox.attr('checked', !checkbox.attr('checked'));
          } else {
            return hpi.selectContentOf(target);
          }
        }
      });
      $('#masterproject, #masterthesis').on('click', function(event) {
        var target;
        target = $(event.target);
        if (target.is('.editing')) {
          return hpi.selectContentOf(target);
        }
      });
      $(function() {
        var i, options, _i;
        options = {
          headers: {
            1: {
              sorter: "text"
            },
            3: {
              sorter: false
            }
          }
        };
        for (i = _i = 5; _i <= 15; i = ++_i) {
          options.headers[i] = {
            sorter: false
          };
        }
        return $("#grades").tablesorter(options);
      });
      hpi.loadFromLocalStorage();
      return hpi.fillOverview();
    },
    initKeyboardShortcuts: function() {
      var keyHandler, str, _i, _len, _ref, _results;
      keyHandler = function(event) {
        var triggered;
        switch (event.keyCode) {
          case 27:
            if (hpi.isEditing()) {
              hpi.stopEditingCourses();
              triggered = true;
            } else if ($('#keyboardShortcutInfo').is(':visible')) {
              hpi.closeKeyboardShortcutInfo();
              triggered = true;
            }
            break;
          case 66:
            if (!hpi.isEditing()) {
              if (event.ctrlKey) {
                hpi.editCourses();
                triggered = true;
              }
            } else {
              if (event.ctrlKey) {
                hpi.stopEditingCourses();
                triggered = true;
              }
            }
            break;
          case 75:
            if (event.ctrlKey && hpi.isEditing()) {
              hpi.newCourse();
              triggered = true;
            }
            break;
          case 191:
            if ($('#keyboardShortcutInfo').is(':visible')) {
              hpi.closeKeyboardShortcutInfo();
            } else {
              hpi.showKeyboardShortcutInfo();
            }
        }
        if (triggered) {
          event.preventDefault();
          event.stopPropagation();
          return event.stopImmediatePropagation();
        }
      };
      _ref = ['keydown'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        str = _ref[_i];
        _results.push($(window).on(str, keyHandler));
      }
      return _results;
    },
    newCourse: function() {
      var row;
      row = hpi.addAnotherRow("hier reinklicken und editieren");
      return hpi.selectContentOf(row.children("td:first-child"));
    },
    showEditButtons: function(mode) {
      var btn, _i, _len, _ref, _results;
      if (mode !== false) {
        mode = true;
      }
      $("#btn-edit-start").toggleClass("hidden", mode);
      _ref = [$("#btn-edit-confirm"), $("#btn-add-row")];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        btn = _ref[_i];
        _results.push(btn.toggleClass("hidden", !mode));
      }
      return _results;
    },
    editCourses: function() {
      var cell, element, range, sel, _i, _len, _ref;
      _ref = hpi.editables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        element.toggleClass("editing", true);
      }
      hpi.showEditButtons();
      hpi.addRemoveRowButtons();
      hpi.enableEditingContent();
      hpi.replaceRadioButtonsWithCheckboxes();
      cell = $('#grades td:first');
      if (!cell.empty()) {
        range = document.createRange();
        if (cell[0].childNodes[0].TEXT_NODE !== cell[0].childNodes[0].nodeType) {
          hpi.selectContentOf(cell);
        }
        range.setStartBefore(cell[0].childNodes[0]);
        range.setEndBefore(cell[0].childNodes[0]);
        sel = window.getSelection();
        sel.removeAllRanges();
        return sel.addRange(range);
      }
    },
    stopEditingCourses: function() {
      var element, _i, _len, _ref;
      _ref = hpi.editables;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        element.toggleClass("editing", false);
      }
      hpi.removeRemoveRowButtons();
      hpi.showEditButtons(false);
      hpi.enableEditingContent(false);
      hpi.replaceCheckboxesWithRadioButtons();
      $("#grades").trigger("update");
      hpi.saveToLocalStorage();
      return hpi.fillOverview();
    },
    enableEditingContent: function(mode) {
      if (mode !== false) {
        mode = true;
      }
      $.each([$("#grades"), $("#masterproject_grade"), $("#masterthesis_grade")], function(idx, element) {
        return element.attr("contentEditable", mode);
      });
      $("#grades > thead").attr("contentEditable", false);
      $.each($("#grades td input"), function(idx, element) {
        return $(element).parent('td').attr("contentEditable", false);
      });
      return $("#grades td .row_remove_button").attr("contentEditable", false);
    },
    addRemoveRowButtons: function() {
      var button;
      button = $("<a class=\"btn btn-mini row_remove_button\" style=\"float:right;\" title=\"Kurs löschen\"><i class=\"icon-remove\"></i></a>");
      $("#grades tbody tr td:first-child").append(button);
      return $("#grades tbody tr td a.row_remove_button").click(function() {
        return $(this).parents("tr").remove();
      });
    },
    removeRemoveRowButtons: function() {
      return $("#grades tbody tr td a.row_remove_button").remove();
    },
    addAnotherRow: function(text_for_first_row) {
      var row;
      row = $("<tr><td>" + text_for_first_row + "</td><td></td><td></td>" + new Array(12).join("<td><input type=\"checkbox\" /></td>") + "<td></td></tr>");
      $("#grades > tbody").prepend(row);
      return row;
    },
    selectContentOf: function(el) {
      var content, range, sel;
      range = document.createRange();
      content = el[0].childNodes[0];
      if (content) {
        range.selectNode(content);
      } else {
        range.setStart(el[0]);
        range.setEnd(el[0]);
      }
      sel = window.getSelection();
      sel.removeAllRanges();
      return sel.addRange(range);
    },
    replaceCheckboxesWithRadioButtons: function() {
      return $("#grades > tbody tr").each(function(row_idx, row) {
        return $(row).find("td input[type=checkbox]").each(function(idx, checkbox) {
          var radio;
          radio = $("<input>", {
            type: "radio",
            name: row_idx,
            "class": ($(checkbox).is(":checked") ? "" : "hidden")
          });
          if ($(checkbox).data("was_checked")) {
            radio.attr("checked", "checked");
          }
          return $(checkbox).replaceWith(radio);
        });
      });
    },
    replaceRadioButtonsWithCheckboxes: function() {
      return $("#grades > tbody tr td input[type=radio]").each(function(idx, radio) {
        var checkbox;
        checkbox = $("<input>", {
          type: "checkbox"
        });
        if (!$(radio).hasClass("hidden")) {
          checkbox.attr("checked", "checked");
        }
        if ($(radio).is(":checked")) {
          checkbox.data("was_checked", true);
        }
        return $(radio).replaceWith(checkbox);
      });
    },
    isEditing: function() {
      return $("table#grades > tbody").hasClass("editing");
    },
    getGrade: function(row) {
      return parseFloat($(row).find("td:nth-child(15)").text());
    },
    getPoints: function(row) {
      return parseFloat($(row).find("td:nth-child(3)").text());
    },
    courseType: function(row) {
      var index, vts;
      vts = ['itse', 'samt', 'osis', 'ist', 'hct', 'bpet', 'sskdt', 'sskko', 'sskma', 'sskre', 'ssksk'];
      index = $(row).find('td input:checked').parent('td').index();
      if (index > 2 && index < 14) {
        return vts[index - 3];
      }
      return null;
    },
    collectGrades: function() {
      var grades;
      grades = {
        itse: [],
        samt: [],
        osis: [],
        ist: [],
        hct: [],
        bpet: [],
        sskdt: [],
        sskko: [],
        sskma: [],
        sskre: [],
        ssksk: []
      };
      $("#grades > tbody tr").each(function(row_idx, row) {
        var grade, points, type;
        row = $(row);
        points = hpi.getPoints(row);
        grade = hpi.getGrade(row);
        type = hpi.courseType(row);
        if (points && grade && type) {
          grades[type].push([grade, points]);
          return row.toggleClass("error", false);
        } else {
          return row.toggleClass("error", true);
        }
      });
      return grades;
    },
    getOverviewGrade: function(grade_type) {
      var grade;
      grade = parseFloat($("#" + grade_type + "_grade").text());
      $("#" + grade_type + "_lp").text(grade ? $("#" + grade_type + "_lp_orig").text() : '-');
      $("#" + grade_type).toggleClass("error", !grade);
      return grade;
    },
    getMasterprojectGrade: function() {
      return hpi.getOverviewGrade("masterproject");
    },
    getMasterthesisGrade: function() {
      return hpi.getOverviewGrade("masterthesis");
    },
    sumupGrades: function(grades, maxLP, factorLp) {
      var calc_lp, factored_lp, pos, rest_lp, sum_count, sum_grade, sum_lp;
      sum_grade = sum_count = sum_lp = pos = 0;
      grades.sort(function(a, b) {
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      });
      if (maxLP < factorLp) {
        factorLp = maxLP;
      }
      while ((sum_lp < maxLP) && (pos < grades.length)) {
        if (sum_lp < factorLp) {
          if (sum_lp + grades[pos][1] > factorLp) {
            factored_lp = factorLp - sum_lp;
            rest_lp = grades[pos][1] - factored_lp;
            sum_grade += 3 * grades[pos][0] * factored_lp;
            sum_count += 3 * factored_lp;
            sum_lp += factored_lp;
            if (sum_lp < maxLP) {
              if (sum_lp + rest_lp > maxLP) {
                calc_lp = maxLP - sum_lp;
                sum_grade += grades[pos][0] * calc_lp;
                sum_count += calc_lp;
                sum_lp += calc_lp;
              } else {
                sum_grade += grades[pos][0] * rest_lp;
                sum_count += rest_lp;
                sum_lp += rest_lp;
              }
            }
          } else {
            sum_grade += 3 * grades[pos][0] * grades[pos][1];
            sum_count += 3 * grades[pos][1];
            sum_lp += grades[pos][1];
          }
        } else {
          if (sum_lp + grades[pos][1] > maxLP) {
            calc_lp = maxLP - sum_lp;
            sum_grade += grades[pos][0] * calc_lp;
            sum_count += calc_lp;
            sum_lp += calc_lp;
          } else {
            sum_grade += grades[pos][0] * grades[pos][1];
            sum_count += grades[pos][1];
            sum_lp += grades[pos][1];
          }
        }
        pos++;
      }
      return [sum_grade / sum_count, sum_count, sum_lp];
    },
    getSskLp: function(ssktype) {
      var lp;
      lp = 0;
      $("#grades > tbody tr").each(function(row_idx, row) {
        var points, type;
        row = $(row);
        points = hpi.getPoints(row);
        type = hpi.courseType(row);
        if (points && type) {
          if (type === "ssk" + ssktype) {
            lp += points;
          }
          return row.toggleClass("error", false);
        } else {
          return row.toggleClass("error", true);
        }
      });
      if (ssktype === "dt") {
        return (lp > 12 ? 12 : lp);
      }
      if (lp > 6) {
        return 6;
      } else {
        return lp;
      }
    },
    getSskLpSum: function() {
      return hpi.getSskLp("ma") + hpi.getSskLp("dt") + hpi.getSskLp("ko") + hpi.getSskLp("re") + hpi.getSskLp("sk");
    },
    fillOverview: function() {
      var courses, final_grade, final_lp, grades, itse_data, masterproject_grade, masterthesis_grade, ssk, sskma, vt1_data, vt2_data;
      grades = hpi.collectGrades();
      masterproject_grade = hpi.getMasterprojectGrade();
      masterthesis_grade = hpi.getMasterthesisGrade();
      itse_data = hpi.sumupGrades(grades.itse, 24, 18);
      $("#itse_lp").text(itse_data[2]);
      $("#itse_grade").text((itse_data[0] ? itse_data[0].toFixed(2) : ""));
      $("#itse").toggleClass("error", itse_data[2] < 24);
      courses = _.map(['samt', 'osis', 'ist', 'hct', 'bpet'], function(vt) {
        return [vt, hpi.sumupGrades(grades[vt], 24, 18)];
      });
      courses.sort(function(a, b) {
        if (a[1][2] > b[1][2]) {
          return -1;
        }
        if (a[1][2] < b[1][2]) {
          return 1;
        }
        return 0;
      });
      vt1_data = courses[0][1];
      $("#vt1_lp").text(vt1_data[2]);
      $("#vt1_grade").text((vt1_data[0] ? vt1_data[0].toFixed(2) : ""));
      $("#vt1_weight").text(vt1_data[2] > 0 ? courses[0][0] : '');
      $("#vt1").toggleClass("error", vt1_data[2] < 24);
      vt2_data = hpi.sumupGrades(grades[courses[1][0]], 15, 9);
      $("#vt2_lp").text(vt2_data[2]);
      $("#vt2_grade").text((vt2_data[0] ? vt2_data[0].toFixed(2) : ""));
      $("#vt2_weight").text(vt2_data[2] > 0 ? courses[1][0] : '');
      $("#vt2").toggleClass("error", vt2_data[2] < 15);
      sskma = hpi.getSskLp("ma");
      $("#sskma_lp").text(sskma);
      $("#sskma").toggleClass("error", sskma < 6);
      ssk = hpi.getSskLpSum();
      $("#ssk").toggleClass("error", ssk < 18);
      $("#ssk_lp").text(ssk);
      final_grade = final_lp = 0;
      if (masterthesis_grade) {
        final_grade += masterthesis_grade * 3 * 30;
        final_lp += 3 * 30;
      }
      if (masterproject_grade) {
        final_grade += masterproject_grade * 3 * 9;
        final_lp += 3 * 9;
      }
      if (itse_data[0]) {
        final_grade += itse_data[0] * itse_data[1];
        final_lp += itse_data[1];
      }
      if (vt1_data[0]) {
        final_grade += vt1_data[0] * vt1_data[1];
        final_lp += vt1_data[1];
      }
      if (vt2_data[0]) {
        final_grade += vt2_data[0] * vt2_data[1];
        final_lp += vt2_data[1];
      }
      final_grade = final_grade / final_lp;
      return $("#final_grade").text(final_grade.toFixed(2));
    },
    extractJsonFromInput: function(input) {
      var json;
      json = {};
      if (input.attr("type") === "radio") {
        json["active"] = !input.hasClass("hidden");
        json["selected"] = !!input.is(":checked");
      } else {
        json["active"] = !!input.is(":checked");
        json["selected"] = !!input.data("was_checked");
      }
      return json;
    },
    extractJson: function() {
      var json;
      json = {};
      json["masterprojectgrade"] = hpi.getMasterprojectGrade();
      json["masterthesisgrade"] = hpi.getMasterthesisGrade();
      json["rows"] = [];
      $("#grades > tbody tr").each(function(row_idx, row) {
        var tmp;
        row = $(row);
        tmp = _.map([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], function(i) {
          if (i <= 3 || i === 15) {
            return $.trim(row.find("td:nth-child( " + i + ")").text());
          } else {
            return hpi.extractJsonFromInput(row.find("td:nth-child( " + i + ") input"));
          }
        });
        return json.rows.push(tmp);
      });
      return json;
    },
    applyJson: function(json) {
      var i, j, row_elem, _i, _len, _ref;
      if (json.masterprojectgrade) {
        $("#masterproject_grade").text(json.masterprojectgrade.toFixed(1));
      }
      if (json.masterthesisgrade) {
        $("#masterthesis_grade").text(json.masterthesisgrade.toFixed(1));
      }
      $("#grades > tbody tr").each(function(row_idx, row) {
        return $(row).remove();
      });
      if (json.rows) {
        i = json.rows.length - 1;
        while (i >= 0) {
          row_elem = hpi.addAnotherRow(json.rows[i][0]);
          _ref = [1, 2, 14];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            j = _ref[_i];
            row_elem.find("td:nth-child( " + (j + 1) + ")").text(json.rows[i][j]);
          }
          _.each([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], function(j) {
            if (json.rows[i][j].active) {
              row_elem.find("td:nth-child( " + (j + 1) + ") input").attr("checked", "checked");
            }
            if (json.rows[i][j].selected) {
              return row_elem.find("td:nth-child( " + (j + 1) + ") input").data("was_checked", true);
            }
          });
          i--;
        }
      }
      if (!hpi.isEditing()) {
        hpi.replaceCheckboxesWithRadioButtons();
      }
      return hpi.fillOverview();
    },
    saveToLocalStorage: function() {
      var json;
      json = hpi.extractJson();
      return localStorage.setItem("course_data", JSON.stringify(json));
    },
    loadFromLocalStorage: function() {
      var json;
      json = JSON.parse(localStorage.getItem("course_data"));
      if (json === null) {
        json = hpi.example_row_data();
      }
      if (json) {
        return hpi.applyJson(json);
      }
    },
    example_row_data: function() {
      return {
        masterprojectgrade: null,
        masterthesisgrade: null,
        rows: [
          [
            "Beispielvorlesung", "WS 12/13", "6", {
              active: true,
              selected: true
            }, {
              active: true,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: true,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, {
              active: false,
              selected: false
            }, "2.7"
          ]
        ]
      };
    },
    showKeyboardShortcutInfo: function() {
      return $('#keyboardShortcutInfo').show();
    },
    closeKeyboardShortcutInfo: function() {
      return $('#keyboardShortcutInfo').hide();
    }
  };

}).call(this);
