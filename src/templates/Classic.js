import React from 'react';
import { format, compareAsc } from 'date-fns'
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import {toTitleCase} from '../utils/helper';
import ListItem from './components/ListItem';

// Register font
// Font.register({ family: 'Roboto', src: source });
Font.registerHyphenationCallback(word => [word]);


// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f1f1f1',
    padding: '40 40 40 40',
  },
  section: {
    padding: 10,
  },
  bullet: {
    padding: '0 10',
  },
  h1: {
    fontSize: '16px',
    margin: '0 0 4px 0',
  },
  h2: {
    fontSize: '14px',
    margin: '0 0 4px 0',
  },
  h3: {
    fontSize: '12px',
    margin: '0 0 4px 0',
  },
  h4: {
    fontSize: '10px',
    margin: '0 0 4px 0',
  },
  subHeader2: {
    fontSize: 12
  },
  subHeader3: {
    fontSize: '11px',
    fontWeight: 600,
  },
  line: {
    height: "1px",
    backgroundColor: "#000000"
  },
  line2: {
    height: "2px",
    backgroundColor: "#000000"
  },
  line3: {
    height: "3px",
    backgroundColor: "#000000"
  },
  header: {
    // margin: '40 40 0 40',
    paddingBottom: 20,
    name: {
      fontSize: 20,
      // fontFamily: 'Roboto',
      fontWeight: 'bolder',
      letterSpacing: 2,
      margin: '0 auto',
      paddingBottom: '5px'
    },
    headline: {
      fontSize: 12,
      color: '#BBBBBB'
    },
    summary: {
      fontSize: '11px',
      color: '#000000',
      lineHeight: '1.3',
    },
    contacts: {
      display: 'flex',
      flexDirection: 'row',
      textAlign: 'center',
      fontSize: '11px',
      margin: '0 auto',
      padding: '2px 0 10px 0',
      contact: {
        flexGrow: 1
      }
    },
    line: {
      height: '1px',
      marginBottom: '1px',
      backgroundColor: "#000000"
    },
    line2: {
      height: '2px',
      marginBottom: '1px',
      backgroundColor: "#000000"
    },
  },
  body: {
    display: 'flex',
    margin: '0',
    flexDirection: 'row',
    sectionHeader: {
      width: '100%',
      marginBottom: "12px",
      line: {
        height: "2px",
        backgroundColor: "#000000"
      }
    },
    main: {
      employment: {
        marginBottom: 20,
        job: {
          paddingBottom: 10,
          role: {
            flexGrowth: 1,
            flexDirection: 'row',
            marginBottom: '2px'
          },
          title: {
            width: '100%',
            fontSize: '12px',
            fontWeight: 'bold',
            paddingRight: '10px'
          },
          description: {
            fontSize: '11px',
            marginBottom: '6px'
          },
          date: {
            fontSize: '11px',
            color: '#000000',
          },
          location: {
            fontSize: '11px',
            marginBottom: 4,
          },
          tasks: {
            flexDirection: 'column',
            justifyContent: 'center',
            task: {
              flexDirection: 'col',
              marginBottom: '2px',
              fontSize: '11px',
              lineHeight: '1.2',
              color: '#000000',
            }
          }

        }
      },
      education: {
        marginBottom: 20,
        school: {
          paddingBottom: 10,
          study: {
            flexGrowth: 1,
            flexDirection: 'row',
            marginBottom: '4px'
          },
          degree: {
            width: '100%',
            fontSize: '12px',
            fontWeight: 'bold',
            paddingRight: '10px'
          },
          description: {
            fontSize: '11px',
            marginBottom: '6px'
          },
          date: {
            fontSize: '11px',
            color: '#000000',
          },
          location: {
            fontSize: '11px',
            color: '#A1A1A1',
            marginBottom: 4,
          },
        }
      },
      list: {
        flexDirection: 'row',
        width: '100%',
        flexWrap: 'wrap',
        marginBottom: '20px',
        item: {
          margin: '2px 0',
          padding: 0,
          width: '50%',
          flexGrow: 1,
          value: {
            color: '#626262',
            fontSize: '11px',
          },
        }
      }

    }

  }
});

// Create Document Component
const Classic = (props) => (
  <Document>
    <Page wrap size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.header.name}>{props?.resume?.firstName} {props?.resume?.lastName}</Text>
        <View style={styles.header.line}></View>
        <View style={styles.header.line2}></View>
        <View style={styles.header.contacts}>
          <Text>{props?.resume?.primaryPhone?.value}</Text>
          <Text> {'\u2022' + " "} </Text>
          <Text>{props?.resume?.primaryEmail?.value}</Text>
        </View>
        <View style={styles.header.summary}>
          <Text style={styles.header.summary}>Innovative Programmer and Internet Entrepreneur striving to make the
            world a more unified and connected place. A creative thinker, adept ir
            software development and working with various data structures
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.body.main}>

          <View style={styles.body.main.employment}>
            <View style={styles.body.sectionHeader}>
              <Text style={styles.h4}>EMPLOYMENT HISTORY</Text>
            </View>
            {props.resume.experiences.map((job) => (
              <View style={styles.body.main.employment.job}>
                <View style={styles.body.main.employment.job.role}>
                  <Text style={styles.body.main.employment.job.title}>{job.employmentTitle}</Text>
                  <Text style={styles.body.main.employment.job.date}>{format(new Date(job.fromDate), 'MMM yy')} - {job.thruDate?format(new Date(job.thruDate), 'MMM yy'):'Present'}</Text>
                </View>
                <View>
                  <Text style={styles.body.main.employment.job.location}>{job.city? job.city : job.state? job.state + ',': job.country}</Text>
                </View>
                <View style={styles.body.main.employment.job.tasks}>
                  {job.description && <Text style={styles.body.main.employment.job.description}>{job.description}</Text>}
                  {job.tasks &&
                  <View style={styles.body.main.employment.job.tasks.task}>
                    {job.tasks.map((task) => (
                      <ListItem>{task}</ListItem>
                    ))}

                  </View>
                  }
                  {/* <View style={styles.body.main.employment.job.tasks.task}> */}
                  {/*   <Text style={{ marginHorizontal: 8 }}>•</Text> */}
                  {/*   <Text>Worked to enhance software systems to help educators, scientists */}
                  {/*     and policy experts already working on some of humanity's greatest */}
                  {/*     challenges. */}
                  {/*   </Text> */}
                  {/* </View> */}
                </View>
              </View>
            ))}
          </View>

          {props.resume.educations.length &&
            <View wrap style={styles.body.main.education}>
              <View style={styles.body.sectionHeader}>
                <Text style={styles.h4}>EDUCATION</Text>
              </View>
              {props.resume.educations.map((edu) => (
                <View wrap style={styles.body.main.education.school}>
                  <View style={styles.body.main.education.school.study}>
                    <Text style={styles.body.main.education.school.degree}>{toTitleCase(edu.degree)} of {toTitleCase(edu.fieldOfStudy.name)}, {toTitleCase(edu.institute.name)}</Text>
                    <Text style={styles.body.main.education.school.date}>{format(new Date(edu.fromDate), 'MMM yy')} - {format(new Date(edu.fromDate), 'MMM yy')}</Text>
                  </View>
                  <View>
                    <Text style={styles.body.main.education.school.location}>{edu.institute.primaryAddress.city?edu.institute.primaryAddress.city:''}{edu.institute.primaryAddress.country?', ' + edu.institute.primaryAddress.country:''}</Text>
                  </View>
                </View>
              ))}
            </View>
          }
          {props.resume.skills.length &&
            <View wrap>
              <View style={styles.body.sectionHeader}>
                <Text style={styles.h4}>SKILLS</Text>
              </View>
              <View style={styles.body.main.list}>
                {props.resume.skills.map((skill) => (
                  <View wrap style={styles.body.main.list.item}>
                    <Text style={styles.body.main.list.item.value}> {'\u2022' + " "} {skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          }
          {props.resume.languages.length &&
            <View>
              <View style={styles.body.sectionHeader}>
                <Text style={styles.h1}>LANGUAGES</Text>
              </View>
              <View style={styles.body.main.list}>
                {props.resume.languages.map((language) => (
                  <View style={styles.body.main.list.item} >
                    <Text style={styles.body.main.list.item.value}> {'\u2022' + " "} {language.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          }
        </View>
      </View>
    </Page>
  </Document>
);


export default Classic;
