window.hpi =
  init: ->
    $("#btn-close-info-window").click ->
      hpi.closeKeyboardShortcutInfo()
    $("#btn-edit-start").click ->
      hpi.editCourses()
    $("#btn-edit-confirm").click ->
      hpi.stopEditingCourses()
    $("#btn-add-row").click ->
      hpi.newCourse()
    $("table#grades").on "click", "td input[type=radio]", ->
      hpi.saveToLocalStorage()
      hpi.fillOverview()
    $("#download_data").click ->
      blob = new Blob([JSON.stringify(hpi.extractJson())], type: "application/octet-stream" )
      button = $(this)
      button.attr "href", URL.createObjectURL(blob)
      button.attr "download", "hpi_masterplan.json"
    $("#restore_data").click ->
      button = $(this)
      fileList = $("#file_to_restore")[0].files
      $("#file_upload_info").toggleClass "hidden", fileList.length > 0
      return if fileList.length = 0
      file = fileList[0]
      reader = new FileReader()
      reader.onload = (evt) ->
        json = JSON.parse(evt.target.result)
        if json
          hpi.applyJson json
          hpi.saveToLocalStorage()
      reader.readAsText file
    hpi.initKeyboardShortcuts()

    hpi.editables = [$("#grades > tbody"), $("#masterproject_grade"), $("#masterthesis_grade")]

    # in editing mode:
    # when clicking on a text-cell: select text. when clicking on a checkbox-cell toggle checkbox
    $('#grades').on 'click', '.editing td', (event) ->
      target = $(event.target)
      if target.parent('.editing')
        checkbox = target.children('input[type=checkbox]')
        if checkbox.length > 0
          checkbox.attr 'checked', not checkbox.attr 'checked'
        else
          hpi.selectContentOf target

    # when clicking on a master(project|thesis) grade, sleect all the text
    $('#masterproject, #masterthesis').on 'click', (event) ->
      target = $(event.target)
      hpi.selectContentOf target if target.is('.editing')

    $ ->
      options = headers:
        1: { sorter: "text" }
        3: { sorter: false }
      options.headers[i] = sorter: false for i in [5..15]
      $("#grades").tablesorter options
    hpi.loadFromLocalStorage()
    hpi.fillOverview()

  initKeyboardShortcuts: ->
    keyHandler = (event) ->
      switch event.keyCode
        when 27 #escapeKey
          if hpi.isEditing()
            hpi.stopEditingCourses()
            triggered = true
          else if $('#keyboardShortcutInfo').is(':visible')
            hpi.closeKeyboardShortcutInfo()
            triggered = true
        when 66 # b-Key
          if not hpi.isEditing()
            if event.ctrlKey
              hpi.editCourses()
              triggered = true
          else
            if event.ctrlKey
              hpi.stopEditingCourses()
              triggered = true
        when 75 # k-Key
          if event.ctrlKey and hpi.isEditing()
            hpi.newCourse()
            triggered = true
        when 191 # ?-Key
          if $('#keyboardShortcutInfo').is(':visible')
            hpi.closeKeyboardShortcutInfo()
          else
            hpi.showKeyboardShortcutInfo()
      if triggered
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

    $(window).on str, keyHandler for str in ['keydown']

  newCourse: ->
    row = hpi.addAnotherRow "hier reinklicken und editieren"
    hpi.selectContentOf row.children("td:first-child")

  showEditButtons: (mode) -> # true->default, false
    mode = true  if mode isnt false
    $("#btn-edit-start").toggleClass "hidden", mode
    btn.toggleClass "hidden", not mode for btn in [$("#btn-edit-confirm"), $("#btn-add-row")]

  editCourses: ->
    element.toggleClass "editing", on for element in hpi.editables
    hpi.showEditButtons()
    hpi.addRemoveRowButtons()
    hpi.enableEditingContent()
    hpi.replaceRadioButtonsWithCheckboxes()
    # put cursor in first cell of the table
    cell = $ '#grades td:first'
    if cell.children().length > 0
      range = document.createRange()
      if cell[0].childNodes[0].TEXT_NODE isnt cell[0].childNodes[0].nodeType
        hpi.selectContentOf cell
      range.setStartBefore cell[0].childNodes[0]
      range.setEndBefore cell[0].childNodes[0]
      sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)

  stopEditingCourses: ->
    element.toggleClass "editing", off for element in hpi.editables
    hpi.removeRemoveRowButtons()
    hpi.showEditButtons no
    hpi.enableEditingContent no
    hpi.replaceCheckboxesWithRadioButtons()
    $("#grades").trigger "update"
    hpi.saveToLocalStorage()
    hpi.fillOverview()

  enableEditingContent: (mode) -> # true->default, false
    mode = true  if mode isnt false
    $.each [$("#grades"), $("#masterproject_grade"), $("#masterthesis_grade")], (idx, element) ->
      element.attr "contentEditable", mode
    $("#grades > thead").attr "contentEditable", off
    $.each $("#grades td input"), (idx, element) ->
      $(element).parent('td').attr "contentEditable", off
    $("#grades td .row_remove_button").attr "contentEditable", off

  addRemoveRowButtons: ->
    button = $("<a class=\"btn btn-mini row_remove_button\" style=\"float:right;\" title=\"Kurs löschen\"><i class=\"icon-remove\"></i></a>")
    $("#grades tbody tr td:first-child").append button
    $("#grades tbody tr td a.row_remove_button").click ->
      $(this).parents("tr").remove()

  removeRemoveRowButtons: ->
    $("#grades tbody tr td a.row_remove_button").remove()

  addAnotherRow: (text_for_first_row) ->
    row = $("<tr><td>" + text_for_first_row + "</td><td></td><td></td>" + new Array(12).join("<td><input type=\"checkbox\" /></td>") + "<td></td></tr>")
    $("#grades > tbody").prepend row
    row

  selectContentOf: (el) ->
    range = document.createRange()
    content = el[0].childNodes[0]
    if content
      range.selectNode content
    else
      range.setStart el[0]
      range.setEnd el[0]
    sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

  replaceCheckboxesWithRadioButtons: ->
    $("#grades > tbody tr").each (row_idx, row) ->
      $(row).find("td input[type=checkbox]").each (idx, checkbox) ->
        radio = $("<input>",
          type: "radio"
          name: row_idx
          class: (if $(checkbox).is(":checked") then "" else "hidden")
        )
        radio.attr "checked", "checked"  if $(checkbox).data("was_checked")
        $(checkbox).replaceWith radio

  replaceRadioButtonsWithCheckboxes: ->
    $("#grades > tbody tr td input[type=radio]").each (idx, radio) ->
      checkbox = $("<input>",
        type: "checkbox"
      )
      checkbox.attr "checked", "checked"  unless $(radio).hasClass("hidden")
      checkbox.data "was_checked", true  if $(radio).is(":checked")
      $(radio).replaceWith checkbox

  isEditing: ->
    $("table#grades > tbody").hasClass "editing"

  getGrade: (row) ->
    parseFloat($(row).find("td:nth-child(15)").text())

  getPoints: (row) ->
    parseFloat($(row).find("td:nth-child(3)").text())

  courseType: (row) ->
    vts = ['itse', 'samt', 'osis', 'ist', 'hct', 'bpet', 'sskdt', 'sskko', 'sskma', 'sskre', 'ssksk']
    index = $(row).find('td input:checked').parent('td').index()
    return vts[ index - 3 ] if index > 2 and index < 14
    null

  collectGrades: ->
    grades = { itse: [], samt: [], osis: [], ist: [], hct: [], bpet: [], \
               sskdt: [], sskko: [], sskma: [], sskre: [], ssksk: [] }
    $("#grades > tbody tr").each (row_idx, row) ->
      row = $(row)
      points = hpi.getPoints(row)
      grade = hpi.getGrade(row)
      type = hpi.courseType(row)
      if points and grade and type
        grades[type].push [grade, points]
        row.toggleClass "error", off
      else
        row.toggleClass "error", on
    grades

  getOverviewGrade: (grade_type) ->
    grade = parseFloat($("##{grade_type}_grade").text())
    $("##{grade_type}_lp").text if grade then $("##{grade_type}_lp_orig").text() else '-'
    $("##{grade_type}").toggleClass "error", not grade
    grade

  getMasterprojectGrade: ->
    hpi.getOverviewGrade "masterproject"

  getMasterthesisGrade: ->
    hpi.getOverviewGrade "masterthesis"

  sumupGrades: (grades, maxLP, factorLp) ->
    sum_grade = sum_count = sum_lp = pos = 0
    grades.sort (a, b) ->
      return -1  if a[0] < b[0]
      return 1  if a[0] > b[0]
      0

    factorLp = maxLP  if maxLP < factorLp
    while (sum_lp < maxLP) and (pos < grades.length)
      if sum_lp < factorLp
        if sum_lp + grades[pos][1] > factorLp
          factored_lp = factorLp - sum_lp
          rest_lp = grades[pos][1] - factored_lp
          sum_grade += 3 * grades[pos][0] * factored_lp
          sum_count += 3 * factored_lp
          sum_lp += factored_lp
          if sum_lp < maxLP
            if sum_lp + rest_lp > maxLP
              calc_lp = maxLP - sum_lp
              sum_grade += grades[pos][0] * calc_lp
              sum_count += calc_lp
              sum_lp += calc_lp
            else
              sum_grade += grades[pos][0] * rest_lp
              sum_count += rest_lp
              sum_lp += rest_lp
        else
          sum_grade += 3 * grades[pos][0] * grades[pos][1]
          sum_count += 3 * grades[pos][1]
          sum_lp += grades[pos][1]
      else
        if sum_lp + grades[pos][1] > maxLP
          calc_lp = maxLP - sum_lp
          sum_grade += grades[pos][0] * calc_lp
          sum_count += calc_lp
          sum_lp += calc_lp
        else
          sum_grade += grades[pos][0] * grades[pos][1]
          sum_count += grades[pos][1]
          sum_lp += grades[pos][1]
      pos++
    # [average_grade, summed_weight, used_lp]
    [sum_grade / sum_count, sum_count, sum_lp]

  getSskLp: (ssktype) ->
    lp = 0
    $("#grades > tbody tr").each (row_idx, row) ->
      row = $(row)
      points = hpi.getPoints(row)
      type = hpi.courseType(row)
      if points and type
        lp += points  if type is "ssk" + ssktype
        row.toggleClass "error", off
      else
        row.toggleClass "error", on

    return (if lp > 12 then 12 else lp)  if ssktype is "dt"
    (if lp > 6 then 6 else lp)

  getSskLpSum: ->
    hpi.getSskLp("ma") + hpi.getSskLp("dt") + hpi.getSskLp("ko") + hpi.getSskLp("re") + hpi.getSskLp("sk")

  fillOverview: ->
    grades = hpi.collectGrades()
    masterproject_grade = hpi.getMasterprojectGrade()
    masterthesis_grade = hpi.getMasterthesisGrade()
    itse_data = hpi.sumupGrades(grades.itse, 24, 18)
    $("#itse_lp").text itse_data[2]
    $("#itse_grade").text (if itse_data[0] then itse_data[0].toFixed(2) else "")
    $("#itse").toggleClass "error", itse_data[2] < 24
    courses = _.map ['samt', 'osis', 'ist', 'hct', 'bpet'], (vt) ->
      [vt, hpi.sumupGrades(grades[vt], 24, 18)]
    # sort vt's by their lp-sum (vt with most lp ist vt1, seconds will be vt2)
    courses.sort (a, b) ->
      return -1  if a[1][2] > b[1][2]
      return 1  if a[1][2] < b[1][2]
      0

    vt1_data = courses[0][1]
    $("#vt1_lp").text vt1_data[2]
    $("#vt1_grade").text (if vt1_data[0] then vt1_data[0].toFixed(2) else "")
    # display text only if a course is listed in this vt
    $("#vt1_weight").text if vt1_data[2] > 0 then courses[0][0] else ''
    $("#vt1").toggleClass "error", vt1_data[2] < 24
    vt2_data = hpi.sumupGrades(grades[courses[1][0]], 15, 9)
    $("#vt2_lp").text vt2_data[2]
    $("#vt2_grade").text (if vt2_data[0] then vt2_data[0].toFixed(2) else "")
    # display text only if a course is listed in this vt
    $("#vt2_weight").text if vt2_data[2] > 0 then courses[1][0] else ''
    $("#vt2").toggleClass "error", vt2_data[2] < 15
    sskma = hpi.getSskLp("ma")
    $("#sskma_lp").text sskma
    $("#sskma").toggleClass "error", sskma < 6
    ssk = hpi.getSskLpSum()
    $("#ssk").toggleClass "error", ssk < 18
    $("#ssk_lp").text ssk
    final_grade = final_lp = 0
    if masterthesis_grade
      final_grade += masterthesis_grade * 3 * 30
      final_lp += 3 * 30
    if masterproject_grade
      final_grade += masterproject_grade * 3 * 9
      final_lp += 3 * 9
    if itse_data[0]
      final_grade += itse_data[0] * itse_data[1]
      final_lp += itse_data[1]
    if vt1_data[0]
      final_grade += vt1_data[0] * vt1_data[1]
      final_lp += vt1_data[1]
    if vt2_data[0]
      final_grade += vt2_data[0] * vt2_data[1]
      final_lp += vt2_data[1]
    final_grade = final_grade / final_lp
    $("#final_grade").text final_grade.toFixed(2)

  extractJsonFromInput: (input) ->
    json = {}
    if input.attr("type") is "radio"
      json["active"] = not input.hasClass("hidden")
      json["selected"] = !!input.is(":checked")
    else # checkbox
      json["active"] = !!input.is(":checked")
      json["selected"] = !!input.data("was_checked")
    json

  extractJson: ->
    json = {}
    json["masterprojectgrade"] = hpi.getMasterprojectGrade()
    json["masterthesisgrade"] = hpi.getMasterthesisGrade()
    json["rows"] = []
    $("#grades > tbody tr").each (row_idx, row) ->
      row = $(row)
      # course name, semester, lp, itse, samt, osis, ist, hct, bpet, sskdt, sskko, sskma, sskre, ssksk, grade
      tmp = _.map [1..15], (i) ->
        if i <= 3 or i == 15
          $.trim(row.find("td:nth-child( #{i})").text())
        else
          hpi.extractJsonFromInput(row.find("td:nth-child( #{i}) input"))
      json.rows.push tmp
    json

  applyJson: (json) ->
    $("#masterproject_grade").text json.masterprojectgrade.toFixed(1) if json.masterprojectgrade
    $("#masterthesis_grade").text  json.masterthesisgrade.toFixed(1)  if json.masterthesisgrade
    # delete all existing courses
    $("#grades > tbody tr").each (row_idx, row) ->
      $(row).remove()
    # add rows from json
    if json.rows
      i = json.rows.length - 1
      while i >= 0
        row_elem = hpi.addAnotherRow(json.rows[i][0])
        row_elem.find("td:nth-child( #{j + 1})").text json.rows[i][j] for j in [1, 2, 14]
        _.each [3..13], (j) ->
          row_elem.find("td:nth-child( #{j + 1}) input").attr "checked", "checked" if json.rows[i][j].active
          row_elem.find("td:nth-child( #{j + 1}) input").data "was_checked", true  if json.rows[i][j].selected
        i--
    hpi.replaceCheckboxesWithRadioButtons() unless hpi.isEditing()
    hpi.fillOverview()

  saveToLocalStorage: ->
    json = hpi.extractJson()
    localStorage.setItem "course_data", JSON.stringify(json)

  loadFromLocalStorage: ->
    json = JSON.parse(localStorage.getItem("course_data"))
    json = hpi.example_row_data() if json is null
    hpi.applyJson json  if json

  example_row_data: ->
    {
      masterprojectgrade: null,
      masterthesisgrade: null,
      rows:[[
        "Beispielvorlesung",
        "WS 12/13",
        "6",
        {active: true,  selected: true},
        {active: true,  selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        {active: true,  selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        {active: false, selected: false},
        "2.7"
        ]]
    }

  showKeyboardShortcutInfo: ->

    $('#keyboardShortcutInfo').show()

  closeKeyboardShortcutInfo: ->
    $('#keyboardShortcutInfo').hide()