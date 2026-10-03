unit MainForm;

interface

uses
  Winapi.Windows, System.SysUtils, Vcl.Forms, DataModule;

type
  TFormMain = class(TForm)
    procedure ButtonSubmitClick(Sender: TObject);
  private
    { Private declarations }
  public
    { Public declarations }
  end;

function CallNativeLibrary(lpParam: PChar): Integer; stdcall; external 'NativeHelper.dll';

implementation

{$R *.dfm}

procedure TFormMain.ButtonSubmitClick(Sender: TObject);
begin
  CallNativeLibrary('Submit');
end;

end.
