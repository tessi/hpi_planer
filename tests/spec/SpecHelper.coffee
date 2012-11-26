beforeEach ->
  @addMatchers toBeNaN: (nan) ->
    isNaN nan
