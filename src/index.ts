import Airtable from "airtable";
import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.listen(3000, () => {
  console.log("Server is running");
});

app.use(express.json());

Airtable.configure({
  apiKey: process.env.AIRTABLE_TOKEN,
  endpointUrl: "https://api.airtable.com",
});

interface FormDataType {
  field1?: string;
  answer1?: string;
  field2?: string;
  answer2?: string;
}

app.use("/webhook", async (req: Request, res: Response) => {

  try {
    const fields = req.body.form_response.definition.fields;
    const answers = req.body.form_response.answers;

    const formData: FormDataType = {};

    fields.map((field: any, index: 1 | 2) => {
      formData[`field${index + 1}` as keyof FormDataType] = field.title;
      formData[`answer${index + 1}` as keyof FormDataType] =
        answers[index][answers[index].type];
    });

    console.log("here", formData);

    await logToAirtable(formData);

    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
  }
});

const logToAirtable = async (formData: FormDataType) => {
  var base = Airtable.base(process.env.AIRTABLE_BASE_ID as string);

  base("Projects").create(
    [
      {
        // @ts-ignore
        fields: formData,
      },
    ],
    function (err: any, records: any) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record: any) {
        console.log(record.getId());
      });
    }
  );
};

// const mocktest = async () => {
//   const fields = mockFields;
//   const answers = mockAnswers;

//   const formData: FormDataType = {};

//   // @ts-ignore
//   fields.map((field: any, index: 1 | 2) => {
//     formData[`field${index + 1}` as keyof FormDataType] = field.title;
//     formData[`answer${index + 1}` as keyof FormDataType] =
//       // @ts-ignore
//       answers[index][answers[index].type];
//   });

//   await logToAirtable(formData);
// };

// mocktest();
