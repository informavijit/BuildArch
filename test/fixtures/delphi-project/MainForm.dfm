object FormMain: TFormMain
  Left = 0
  Top = 0
  Caption = 'Delphi Main Form'
  ClientHeight = 300
  ClientWidth = 400
  object ButtonSubmit: TButton
    Left = 20
    Top = 20
    Width = 100
    Height = 30
    Caption = 'Submit'
    OnClick = ButtonSubmitClick
  end
  object FDConnection1: TFDConnection
    ConnectionName = 'DBConn'
  end
end
